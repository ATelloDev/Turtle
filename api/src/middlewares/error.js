import { logger } from '../utils/logger.js';

export function notFound(req, res, next){
  res.status(404).json({ ok:false, message:'Ruta no encontrada' });
}

export function errorHandler(err, req, res, next){
  logger.error(err.stack || err.message || err);
  const status = err.status || 500;
  res.status(status).json({ ok:false, message: err.message || 'Error interno' });
}
