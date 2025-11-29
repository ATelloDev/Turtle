import { getPool, sql } from '../config/db.js';

/**
 * UsersRepo
 * Acceso a datos en SQL Server para la tabla dbo.Users.
 * No aplica reglas de negocio, solo SQL y shape de datos.
 */
export const UsersRepo = {
  /**
   * Busca un usuario por nombre de usuario.
   * @param {string} username
   * @returns {Promise<{Id:number, Username:string, PasswordHash:string, Role:string, CreatedAt:Date} | null>}
   */
  async findByUsername(username){
    const pool = await getPool();
    const r = await pool.request().input('username', sql.VarChar(100), username)
      .query('SELECT TOP 1 Id, Username, PasswordHash, Role, CreatedAt FROM Users WHERE Username=@username');
    return r.recordset[0] || null;
  },
  /**
   * Obtiene un usuario por Id (sin PasswordHash).
   * @param {number} id
   * @returns {Promise<{Id:number, Username:string, Role:string, CreatedAt:Date} | null>}
   */
  async findById(id){
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id)
      .query('SELECT Id, Username, Role, CreatedAt FROM Users WHERE Id=@id');
    return r.recordset[0] || null;
  },
  /**
   * Lista de usuarios (sin PasswordHash).
   * @returns {Promise<Array<{Id:number, Username:string, Role:string, CreatedAt:Date}>>}
   */
  async list(){
    const pool = await getPool();
    const r = await pool.request().query('SELECT Id, Username, Role, CreatedAt FROM Users ORDER BY Id DESC');
    return r.recordset;
  },
  /**
   * Crea un usuario.
   * @param {{username:string, passwordHash:string, role:'admin'|'user'}} param0
   * @returns {Promise<{Id:number, Username:string, Role:string, CreatedAt:Date}>}
   */
  async create({ username, passwordHash, role }){
    const pool = await getPool();
    const r = await pool.request()
      .input('username', sql.VarChar(100), username)
      .input('hash', sql.VarChar(200), passwordHash)
      .input('role', sql.VarChar(20), role)
      .query('INSERT INTO Users (Username, PasswordHash, Role) OUTPUT inserted.Id, inserted.Username, inserted.Role, inserted.CreatedAt VALUES (@username, @hash, @role)');
    return r.recordset[0];
  },
  /**
   * Actualiza campos de usuario.
   * @param {number} id
   * @param {{username?:string, passwordHash?:string, role?:'admin'|'user'}} patch
   * @returns {Promise<{Id:number, Username:string, Role:string, CreatedAt:Date}>}
   */
  async update(id, { username, passwordHash, role }){
    const pool = await getPool();
    const setParts = [];
    if(username!==undefined) setParts.push('Username=@username');
    if(passwordHash!==undefined) setParts.push('PasswordHash=@hash');
    if(role!==undefined) setParts.push('Role=@role');
    const setSQL = setParts.join(', ');
    const req = pool.request().input('id', sql.Int, id);
    if(username!==undefined) req.input('username', sql.VarChar(100), username);
    if(passwordHash!==undefined) req.input('hash', sql.VarChar(200), passwordHash);
    if(role!==undefined) req.input('role', sql.VarChar(20), role);
    const r = await req.query(`UPDATE Users SET ${setSQL} WHERE Id=@id; SELECT Id, Username, Role, CreatedAt FROM Users WHERE Id=@id;`);
    return r.recordset[0];
  },
  /**
   * Elimina un usuario por Id.
   * @param {number} id
   * @returns {Promise<void>}
   */
  async remove(id){
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Users WHERE Id=@id');
  }
};
