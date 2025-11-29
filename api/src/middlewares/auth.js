import jwt from 'jsonwebtoken';

/**
 * Middleware de autenticación JWT.
 * Extrae el token del header Authorization: Bearer <token> y valida su firma.
 * En éxito, adjunta `req.user` con { id, username, role }.
 * Responde 401 si no hay token o si es inválido.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authMiddleware(req, res, next){
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if(!token) return res.status(401).json({ ok:false, message:'Token requerido' });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
    next();
  }catch(e){
    return res.status(401).json({ ok:false, message:'Token inválido' });
  }
}

/**
 * Middleware de autorización por rol exacto.
 * Devuelve 403 si `req.user.role` no coincide con el rol requerido.
 * @param {'admin'|'user'} role Rol permitido
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 */
export function requireRole(role){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({ ok:false, message:'No autenticado' });
    if(req.user.role !== role) return res.status(403).json({ ok:false, message:'No autorizado' });
    next();
  };
}
