import sql from 'mssql';

// Configuración LocalDB usando driver por defecto de 'mssql' (tedious) con NTLM.
const SERVER = process.env.DB_SERVER || '(localdb)\\MSSQLLocalDB';
const DB_NAME = process.env.DB_NAME || 'TurtleConver';

/** @type {sql.config} */
const baseConfig = {
  server: SERVER,
  database: DB_NAME,
  options: { trustServerCertificate: true },
  authentication: { type: 'ntlm', options: { userName: undefined, password: undefined, domain: undefined } }
};

/** @type {sql.config} */
const masterConfig = { ...baseConfig, database: 'master' };

let pool;

async function connect(cfg){
  const p = new sql.ConnectionPool(cfg);
  await p.connect();
  return p;
}

async function ensureDatabase(){
  const master = await connect(masterConfig);
  try{
    await master.request().query(`IF DB_ID('${DB_NAME}') IS NULL CREATE DATABASE [${DB_NAME}]`);
  } finally { master.close(); }
}

async function ensureSchema(){
  const p = await connect(baseConfig);
  try{
    await p.request().query(`IF OBJECT_ID('dbo.Users','U') IS NULL
      CREATE TABLE dbo.Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username VARCHAR(100) NOT NULL UNIQUE,
        PasswordHash VARCHAR(200) NOT NULL,
        Role VARCHAR(20) NOT NULL DEFAULT 'user',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );`);
  } finally { p.close(); }
}

export async function initDB(){
  await ensureDatabase();
  await ensureSchema();
}

export async function getPool(){
  if(pool) return pool;
  pool = await connect(baseConfig);
  return pool;
}

export { sql };
