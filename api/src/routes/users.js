import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware, requireRole } from '../middlewares/auth.js';
import { UsersService } from '../services/users.service.js';

export const router = Router();

router.use(authMiddleware);

// GET /api/users
router.get('/', async (req,res,next)=>{
  try{
    const list = await UsersService.list();
    res.json({ ok:true, data:list });
  }catch(err){ next(err); }
});

// POST /api/users
router.post('/',
  requireRole('admin'),
  body('username').isString().isLength({min:3}),
  body('password').isString().isLength({min:3}),
  body('role').optional().isIn(['admin','user']),
  async (req,res,next)=>{
    try{
      const created = await UsersService.create(req.body);
      res.status(201).json({ ok:true, data: created });
    }catch(err){ next(err); }
  }
);

// PUT /api/users/:id
router.put('/:id',
  requireRole('admin'),
  param('id').isInt(),
  body('username').optional().isString().isLength({min:3}),
  body('password').optional().isString().isLength({min:3}),
  body('role').optional().isIn(['admin','user']),
  async (req,res,next)=>{
    try{
      const updated = await UsersService.update(req.params.id, req.body);
      res.json({ ok:true, data: updated });
    }catch(err){ next(err); }
  }
);

// DELETE /api/users/:id
router.delete('/:id', requireRole('admin'), async (req,res,next)=>{
  try{
    await UsersService.remove(req.params.id);
    res.json({ ok:true });
  }catch(err){ next(err); }
});
