-- Turtle Conver - SQL Server schema
IF DB_ID('TurtleConver') IS NULL
BEGIN
  CREATE DATABASE TurtleConver;
END
GO
USE TurtleConver;
GO
IF OBJECT_ID('dbo.Users','U') IS NULL
BEGIN
  CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(200) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'user',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO
-- Seed opcional (el backend también hace seed en caliente). Ajusta el hash si deseas pre-sembrar aquí.
-- INSERT INTO dbo.Users (Username, PasswordHash, Role) VALUES ('admin', '<HASH_BCRYPT>', 'admin');
