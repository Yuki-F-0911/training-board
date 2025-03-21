import { Request, Response } from 'express';
import { Bookmark } from '../models/bookmark';
import { Question } from '../models/Question';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all bookmarks for a user
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user?._id })
      .populate({
        path: 'question',
        populate: {
          path: 'author',
          select: 'username email'
        }
      });

    res.json(bookmarks);
  } catch (error) {
    console.error('ブックマーク取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// @desc    Create a bookmark
// @route   POST /api/bookmarks
// @access  Private
export const createBookmark = async (req: AuthRequest, res: Response) => {
  const { questionId } = req.body;

  try {
    // 質問が存在するか確認
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    // すでにブックマークされているか確認
    const existingBookmark = await Bookmark.findOne({
      user: req.user?._id,
      question: questionId
    });

    if (existingBookmark) {
      return res.status(400).json({ message: 'すでにブックマークされています' });
    }

    // 新しいブックマークを作成
    const bookmark = await Bookmark.create({
      user: req.user?._id,
      question: questionId
    });

    res.status(201).json(bookmark);
  } catch (error) {
    console.error('ブックマーク作成エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:questionId
// @access  Private
export const deleteBookmark = async (req: AuthRequest, res: Response) => {
  const { questionId } = req.params;

  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user?._id,
      question: questionId
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'ブックマークが見つかりません' });
    }

    res.json({ message: 'ブックマークを削除しました' });
  } catch (error) {
    console.error('ブックマーク削除エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}; 