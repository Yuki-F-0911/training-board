import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Bookmark } from '../models/bookmark';
import { Question } from '../models/Question';
import { AuthRequest } from '../middleware/auth';

// @desc    ユーザーのブックマーク一覧を取得
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    // ユーザーIDの確認
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate({
        path: 'question',
        populate: { path: 'author', select: 'username' }
      })
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    console.error('ブックマーク取得エラー:', error);
    res.status(500).json({ message: 'ブックマークの取得中にエラーが発生しました' });
  }
};

// @desc    質問をブックマークに追加
// @route   POST /api/bookmarks
// @access  Private
export const createBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.body;

    // ユーザーIDの確認
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // 質問の存在確認
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    // 既存のブックマークをチェック
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      question: questionId
    });

    if (existingBookmark) {
      return res.status(400).json({ message: 'この質問は既にブックマークされています' });
    }

    // 新しいブックマークを作成
    const bookmark = new Bookmark({
      user: req.user.id,
      question: questionId
    });

    await bookmark.save();
    console.log(`新しいブックマークが作成されました: ユーザーID=${req.user.id}, 質問ID=${questionId}`);

    res.status(201).json(bookmark);
  } catch (error) {
    console.error('ブックマーク作成エラー:', error);
    res.status(500).json({ message: 'ブックマークの作成中にエラーが発生しました' });
  }
};

// @desc    ブックマークを削除
// @route   DELETE /api/bookmarks/:questionId
// @access  Private
export const deleteBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.params;

    // ユーザーIDの確認
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // ブックマークの存在確認と削除
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.id,
      question: questionId
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'ブックマークが見つかりません' });
    }

    console.log(`ブックマークが削除されました: ユーザーID=${req.user.id}, 質問ID=${questionId}`);
    res.json({ message: 'ブックマークが削除されました' });
  } catch (error) {
    console.error('ブックマーク削除エラー:', error);
    res.status(500).json({ message: 'ブックマークの削除中にエラーが発生しました' });
  }
}; 