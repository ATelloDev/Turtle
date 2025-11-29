import swaggerUi from 'swagger-ui-express';

export { swaggerUi };

export const specs = {
  openapi: '3.0.3',
  info: { title: 'Turtle Conver API', version: '1.0.0', description: 'Autenticación, CRUD de usuarios y endpoints PDF (placeholder)' },
  servers: [{ url: 'http://localhost:' + (process.env.PORT || 3000) }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      LoginRequest: { type: 'object', required: ['username','password'], properties: { username:{type:'string'}, password:{type:'string'} } },
      LoginResponse: { type:'object', properties:{ ok:{type:'boolean'}, token:{type:'string'}, user:{ type:'object', properties:{ id:{type:'integer'}, username:{type:'string'}, role:{type:'string'} } } } },
      User: { type:'object', properties:{ Id:{type:'integer'}, Username:{type:'string'}, Role:{type:'string'}, CreatedAt:{type:'string', format:'date-time'} } },
      CreateUser: { type:'object', required:['username','password'], properties:{ username:{type:'string'}, password:{type:'string'}, role:{type:'string', enum:['admin','user']} } },
      UpdateUser: { type:'object', properties:{ username:{type:'string'}, password:{type:'string'}, role:{type:'string', enum:['admin','user']} } },
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/login': {
      post: {
        tags:['Auth'], summary:'Login', requestBody:{ required:true, content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/LoginRequest' } } } },
        responses:{ '200':{ description:'OK', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/LoginResponse' } } } }, '401':{ description:'Credenciales inválidas' } }
      }
    },
    '/api/users': {
      get: { tags:['Users'], summary:'Listar usuarios', responses:{ '200':{ description:'OK' } } },
      post: { tags:['Users'], summary:'Crear usuario', requestBody:{ required:true, content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/CreateUser' } } } }, responses:{ '201':{ description:'Creado' } } }
    },
    '/api/users/{id}': {
      put: { tags:['Users'], summary:'Actualizar usuario', parameters:[{ name:'id', in:'path', required:true, schema:{type:'integer'} }], requestBody:{ content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/UpdateUser' } } } }, responses:{ '200':{ description:'OK' } } },
      delete: { tags:['Users'], summary:'Eliminar usuario', parameters:[{ name:'id', in:'path', required:true, schema:{type:'integer'} }], responses:{ '200':{ description:'OK' } } }
    }
  }
};
