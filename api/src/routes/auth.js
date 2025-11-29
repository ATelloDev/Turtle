import { Router } from 'express';
import { UsersService } from '../services/users.service.js';

export const router = Router();

// Seed admin on startup (lazy)
router.use(async (req,res,next)=>{ try{ await UsersService.ensureAdminSeed(); }catch{} next(); });

/**
 * POST /api/auth/login
 * body: { username, password }
 * 200: { ok:true, token, user }
 * 400/401: { ok:false, message }
 */
router.post('/login', async (req,res,next)=>{
  try{
    const { username, password } = req.body;
    const { token, user } = await UsersService.login({ username, password });
    res.json({ ok:true, token, user });
  }catch(err){ next(err); }
});
