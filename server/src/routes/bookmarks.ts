import express from 'express';
import { protect } from '../middleware/auth';
import { 
  getBookmarks, 
  createBookmark, 
  deleteBookmark 
} from '../controllers/bookmarks';

const router = express.Router();

// すべてのルートに認証が必要
router.use(protect as express.RequestHandler);

// ブックマークのルート
router.get('/', getBookmarks as express.RequestHandler);
router.post('/', createBookmark as express.RequestHandler);
router.delete('/:questionId', deleteBookmark as express.RequestHandler);

export default router; 