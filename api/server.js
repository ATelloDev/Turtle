import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router as authRouter } from './src/routes/auth.js';
import { router as usersRouter } from './src/routes/users.js';
import { errorHandler, notFound } from './src/middlewares/error.js';
import { swaggerUi, specs } from './src/swagger.js';
import { initDB } from './src/config/db.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req,res)=> res.json({ ok:true, name:'Turtle Conver API' }));
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start server immediately so Swagger is available even if DB is down
app.listen(PORT, ()=> console.log(`API running on http://localhost:${PORT}`));

// Initialize DB in background unless explicitly skipped
if(process.env.SKIP_DB_INIT !== 'true'){
  initDB().then(()=>{
    console.log('DB initialized');
  }).catch(err => {
    console.warn('DB init failed (Swagger still available):', err.message || err);
  });
}
