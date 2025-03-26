import { Request, Response } from 'express';
import { Answer } from '../models/Answer';
import { Question } from '../models/Question';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

// @desc    回答の作成
// @route   POST /api/questions/:questionId/answers
// @access  Private
export const createAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const questionId = req.params.questionId;

    // 質問の存在確認
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const answer = await Answer.create({
      content,
      author: req.user._id,
      question: questionId,
    });

    // 作成者情報を含めて返す
    const populatedAnswer = await answer.populate('author', 'username');

    res.status(201).json(populatedAnswer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    質問に対する回答の取得
// @route   GET /api/questions/:questionId/answers
// @access  Public
export const getAnswers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const questionId = req.params.questionId;

    const answers = await Answer.find({ question: questionId })
      .populate('author', 'username')
      .populate({
        path: 'upvotes downvotes',
        select: 'username',
      })
      .sort(sort as string)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Answer.countDocuments({ question: questionId });

    res.json({
      answers,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAnswerById = async (req: Request, res: Response) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('votes.user', 'name');
      
    if (!answer) {
      return res.status(404).json({ message: '回答が見つかりません' });
    }
    
    res.status(200).json(answer);
  } catch (error) {
    console.error('回答取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// @desc    回答の更新
// @route   PUT /api/answers/:id
// @access  Private
export const updateAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: '回答が見つかりません' });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // 回答の作成者かどうかを確認
    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'この操作を実行する権限がありません' });
    }

    const { content } = req.body;
    answer.content = content;

    const updatedAnswer = await answer.save();
    res.json(updatedAnswer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    回答の削除
// @route   DELETE /api/answers/:id
// @access  Private
export const deleteAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: '回答が見つかりません' });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // 回答の作成者かどうかを確認
    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'この操作を実行する権限がありません' });
    }

    await answer.deleteOne();
    res.json({ message: '回答が削除されました' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    回答の評価（いいね/よくないね）
// @route   POST /api/answers/:id/vote
// @access  Private
export const voteAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: '回答が見つかりません' });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    if (voteType === 'upvote') {
      // すでにいいねしている場合は取り消し
      if (answer.upvotes.some(id => id.toString() === userId.toString())) {
        answer.upvotes = answer.upvotes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId.toString());
      } else {
        // よくないねを取り消し、いいねを追加
        answer.downvotes = answer.downvotes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId.toString());
        answer.upvotes.push(userId);
      }
    } else if (voteType === 'downvote') {
      // すでによくないねしている場合は取り消し
      if (answer.downvotes.some(id => id.toString() === userId.toString())) {
        answer.downvotes = answer.downvotes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId.toString());
      } else {
        // いいねを取り消し、よくないねを追加
        answer.upvotes = answer.upvotes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId.toString());
        answer.downvotes.push(userId);
      }
    }

    await answer.save();
    res.json(answer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    回答を承認する
// @route   PUT /api/answers/:id/accept
// @access  Private
export const acceptAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: '回答が見つかりません' });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // 質問の作成者かどうかを確認
    const question = await Question.findById(answer.question);
    if (!question || question.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'この操作を実行する権限がありません' });
    }

    // 同じ質問の他の回答の承認を解除
    await Answer.updateMany(
      { question: answer.question },
      { accepted: false }
    );

    // この回答を承認
    answer.accepted = true;
    await answer.save();

    res.json(answer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}; 