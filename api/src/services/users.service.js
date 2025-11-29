import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsersRepo } from '../repositories/users.repo.js';

/**
 * UsersService
 * Capa de negocio para autenticación y administración de usuarios.
 * - Aplica validaciones y compone respuestas de alto nivel.
 * - No accede directamente a la BD; delega en el repositorio.
 */
export const UsersService = {
  /**
   * Crea el usuario administrador por defecto si no existe.
   * Username: 'admin' | Password: '1234' | Role: 'admin'
   * @returns {Promise<{Id:number, Username:string, Role:string, CreatedAt:Date}>}
   */
  async ensureAdminSeed(){
    const existing = await UsersRepo.findByUsername('admin');
    if(existing) return existing;
    const hash = await bcrypt.hash('1234', 10);
    return UsersRepo.create({ username: 'admin', passwordHash: hash, role: 'admin' });
  },

  /**
   * Autentica a un usuario contra la BD y emite un JWT.
   * @param {{username:string, password:string}} params
   * @throws {Error & {status:number}} 400 si faltan datos, 401 si credenciales inválidas
   * @returns {Promise<{token:string, user:{id:number, username:string, role:string}}>} token + payload
   */
  async login({ username, password }){
    if(!username || !password) throw Object.assign(new Error('Usuario y contraseña requeridos'), { status:400 });
    const user = await UsersRepo.findByUsername(username);
    if(!user) throw Object.assign(new Error('Credenciales inválidas'), { status:401 });
    const ok = await bcrypt.compare(password, user.PasswordHash);
    if(!ok) throw Object.assign(new Error('Credenciales inválidas'), { status:401 });
    const payload = { id: user.Id, username: user.Username, role: user.Role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '2h' });
    return { token, user: payload };
  },

  /**
   * Lista usuarios.
   * @returns {Promise<Array<{Id:number, Username:string, Role:string, CreatedAt:Date}>>}
   */
  async list(){ return UsersRepo.list(); },

  /**
   * Crea un usuario aplicando validaciones básicas y hashing de contraseña.
   * @param {{username:string, password:string, role?:'admin'|'user'}} params
   * @throws {Error & {status:number}} 400 si faltan datos, 409 si ya existe
   * @returns {Promise<{Id:number, Username:string, Role:string, CreatedAt:Date}>}
   */
  async create({ username, password, role='user' }){
    if(!username || !password) throw Object.assign(new Error('username y password son requeridos'), { status:400 });
    const exists = await UsersRepo.findByUsername(username);
    if(exists) throw Object.assign(new Error('Usuario ya existe'), { status:409 });
    const hash = await bcrypt.hash(password, 10);
    return UsersRepo.create({ username, passwordHash: hash, role });
  },

  /**
   * Actualiza parcialmente campos del usuario.
   * @param {number|string} id
   * @param {{username?:string, password?:string, role?:'admin'|'user'}} patch
   * @returns {Promise<{Id:number, Username:string, Role:string, CreatedAt:Date}>}
   */
  async update(id, { username, password, role }){
    const patch = {};
    if(username !== undefined) patch.username = username;
    if(password !== undefined) patch.passwordHash = await bcrypt.hash(password,10);
    if(role !== undefined) patch.role = role;
    return UsersRepo.update(Number(id), patch);
  },

  /**
   * Elimina un usuario por Id.
   * @param {number|string} id
   * @returns {Promise<{ok:true}>}
   */
  async remove(id){
    await UsersRepo.remove(Number(id));
    return { ok:true };
  }
};
