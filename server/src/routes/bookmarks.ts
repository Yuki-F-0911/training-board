import express from 'express';
import { auth } from '../middleware/auth';
import { 
  getBookmarks, 
  createBookmark, 
  deleteBookmark 
} from '../controllers/bookmarks';

const router = express.Router();

// すべてのルートに認証ミドルウェアを適用
router.use(auth);

// ブックマークのルート
router.get('/', getBookmarks);
router.post('/', createBookmark);
router.delete('/:questionId', deleteBookmark);

export default router; 