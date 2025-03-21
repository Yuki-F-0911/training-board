import express from 'express';
import { register, loginUser, getMe } from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginUser);
router.get('/me', protect as express.RequestHandler, getMe as express.RequestHandler);

export default router; 