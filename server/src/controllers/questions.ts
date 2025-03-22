import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { AuthRequest } from '../middleware/auth';

// @desc    質問を作成する
// @route   POST /api/questions
// @access  Private
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    
    // ユーザーIDをチェック
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({ message: '認証されていません' });
    }

    // 新しい質問を作成
    const question = new Question({
      title,
      content,
      tags: tags || [],
      author: authReq.user.id,
    });

    await question.save();
    console.log(`新しい質問が作成されました: ID=${question._id}, タイトル="${title}"`);

    res.status(201).json(question);
  } catch (error) {
    console.error('質問作成エラー:', error);
    res.status(500).json({ message: '質問の作成中にエラーが発生しました' });
  }
};

// @desc    質問の一覧取得
// @route   GET /api/questions
// @access  Public
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    res.json(questions);
  } catch (error) {
    console.error('質問一覧取得エラー:', error);
    res.status(500).json({ message: '質問の取得中にエラーが発生しました' });
  }
};

// @desc    質問の詳細取得
// @route   GET /api/questions/:id
// @access  Public
export const getQuestion = async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'username' }
      });

    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    res.json(question);
  } catch (error) {
    console.error('質問詳細取得エラー:', error);
    res.status(500).json({ message: '質問の取得中にエラーが発生しました' });
  }
};

// @desc    質問を更新する
// @route   PUT /api/questions/:id
// @access  Private
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    // 質問を検索
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    // 認証ユーザーのチェック
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({ message: '認証されていません' });
    }

    // 質問の作成者であることを確認
    if (question.author.toString() !== authReq.user.id.toString()) {
      return res.status(403).json({ message: 'この操作を行う権限がありません' });
    }

    // 質問を更新
    question.title = title || question.title;
    question.content = content || question.content;
    question.tags = tags || question.tags;
    question.updatedAt = new Date();

    await question.save();
    console.log(`質問が更新されました: ID=${question._id}`);

    res.json(question);
  } catch (error) {
    console.error('質問更新エラー:', error);
    res.status(500).json({ message: '質問の更新中にエラーが発生しました' });
  }
};

// @desc    質問を削除する
// @route   DELETE /api/questions/:id
// @access  Private
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 質問を検索
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    // 認証ユーザーのチェック
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({ message: '認証されていません' });
    }

    // 質問の作成者であることを確認
    if (question.author.toString() !== authReq.user.id.toString()) {
      return res.status(403).json({ message: 'この操作を行う権限がありません' });
    }

    // 質問を削除
    await Question.deleteOne({ _id: id });
    console.log(`質問が削除されました: ID=${id}`);

    // 関連する回答も削除
    await Answer.deleteMany({ question: id });
    console.log(`質問に関連する回答が削除されました: 質問ID=${id}`);

    res.json({ message: '質問が削除されました' });
  } catch (error) {
    console.error('質問削除エラー:', error);
    res.status(500).json({ message: '質問の削除中にエラーが発生しました' });
  }
};

// @desc    質問に投票する
// @route   POST /api/questions/:id/vote
// @access  Private
export const voteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;

    // 投票タイプのバリデーション
    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return res.status(400).json({ message: '無効な投票タイプです' });
    }

    // 認証ユーザーのチェック
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({ message: '認証されていません' });
    }

    const userId = new mongoose.Types.ObjectId(authReq.user.id);

    // 質問を検索
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    // 既に投票しているかチェック
    const hasUpvoted = question.upvotes.some(id => id.toString() === userId.toString());
    const hasDownvoted = question.downvotes.some(id => id.toString() === userId.toString());

    // 投票処理
    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // 既にアップボートしている場合は取り消し
        question.upvotes = question.upvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // アップボートを追加
        question.upvotes.push(userId);
        // ダウンボートを取り消し
        if (hasDownvoted) {
          question.downvotes = question.downvotes.filter(id => id.toString() !== userId.toString());
        }
      }
    } else if (voteType === 'downvote') {
      if (hasDownvoted) {
        // 既にダウンボートしている場合は取り消し
        question.downvotes = question.downvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // ダウンボートを追加
        question.downvotes.push(userId);
        // アップボートを取り消し
        if (hasUpvoted) {
          question.upvotes = question.upvotes.filter(id => id.toString() !== userId.toString());
        }
      }
    }

    await question.save();
    console.log(`質問に対する投票が処理されました: ID=${id}, タイプ=${voteType}, ユーザー=${userId}`);

    // 投票カウントを集計
    const upvoteCount = question.upvotes.length;
    const downvoteCount = question.downvotes.length;
    const voteScore = upvoteCount - downvoteCount;

    res.json({
      message: '投票が処理されました',
      voteScore,
      upvoteCount,
      downvoteCount,
      hasUpvoted: question.upvotes.some(id => id.toString() === userId.toString()),
      hasDownvoted: question.downvotes.some(id => id.toString() === userId.toString()),
    });
  } catch (error) {
    console.error('質問投票エラー:', error);
    res.status(500).json({ message: '投票処理中にエラーが発生しました' });
  }
}; 