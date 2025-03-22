import express from 'express';
import { auth } from '../middleware/auth';
import { 
  getBookmarks, 
  createBookmark, 
  deleteBookmark 
} from '../controllers/bookmarks';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// すべてのルートに認証ミドルウェアを適用
router.use(auth);

// ブックマークのルート
router.get('/', async (req, res) => {
  return await getBookmarks(req as AuthRequest, res);
});
router.post('/', async (req, res) => {
  return await createBookmark(req as AuthRequest, res);
});
router.delete('/:questionId', async (req, res) => {
  return await deleteBookmark(req as unknown as AuthRequest, res);
});

export default router; 