import express from 'express';
import { register, login, getMe } from '../controllers/auth';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect as express.RequestHandler, getMe as express.RequestHandler);

export default router; 