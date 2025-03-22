import { Request, Response } from 'express';
import { Question } from '../models/Question';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';


// @desc    質問の作成
// @route   POST /api/questions
// @access  Private
export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const question = await Question.create({
      title,
      content,
      author: req.user._id,
      tags: tags || [],
    });

    // 作成者情報を含めて返す
    const populatedQuestion = await question.populate('author', 'username');

    res.status(201).json(populatedQuestion);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    質問の一覧取得
// @route   GET /api/questions
// @access  Public
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', tag, search } = req.query;

    // クエリの構築
    const query: any = {};

    // タグによるフィルタリング
    if (tag) {
      query.tags = tag;
    }

    // 検索クエリによるフィルタリング
    if (search) {
      query.$text = { $search: search as string };
    }

    const questions = await Question.find(query)
      .populate('author', 'username')
      .sort(sort as string)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    質問の詳細取得
// @route   GET /api/questions/:id
// @access  Public
export const getQuestion = async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id).populate('author', 'username');

    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    // 閲覧数を増やす
    question.views = (question.views || 0) + 1;
    await question.save();

    res.json(question);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    質問の更新
// @route   PUT /api/questions/:id
// @access  Private
export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // 質問の作成者かどうかを確認
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'この操作を実行する権限がありません' });
    }

    const { title, content, tags } = req.body;
    
    question.title = title || question.title;
    question.content = content || question.content;
    question.tags = tags || question.tags;

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    質問の削除
// @route   DELETE /api/questions/:id
// @access  Private
export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // 質問の作成者かどうかを確認
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'この操作を実行する権限がありません' });
    }

    await question.deleteOne();
    res.json({ message: '質問が削除されました' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    質問の評価（いいね/よくないね）
// @route   POST /api/questions/:id/vote
// @access  Private
export const voteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    if (voteType === 'upvote') {
      // すでにいいねしている場合は取り消し
      if (question.upvotes.some(id => id.toString() === userId.toString())) {
        question.upvotes = question.upvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // よくないねを取り消し、いいねを追加
        question.downvotes = question.downvotes.filter(id => id.toString() !== userId.toString());
        question.upvotes.push(userId);
      }
    } else if (voteType === 'downvote') {
      // すでによくないねしている場合は取り消し
      if (question.downvotes.some(id => id.toString() === userId.toString())) {
        question.downvotes = question.downvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // いいねを取り消し、よくないねを追加
        question.upvotes = question.upvotes.filter(id => id.toString() !== userId.toString());
        question.downvotes.push(userId);
      }
    }

    await question.save();
    res.json(question);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}; 