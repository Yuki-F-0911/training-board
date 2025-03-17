import { Request, Response } from 'express';
import { getGeminiModel } from '../config/gemini';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    AIによる質問生成
// @route   POST /api/ai/generate-question
// @access  Private
export const generateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { topic } = req.body;
    const model = getGeminiModel();

    const prompt = `
マラソントレーニングに関する質問を生成してください。
以下の形式で出力してください：
{
  "title": "質問のタイトル（50-100文字）",
  "content": "質問の詳細な内容（200-500文字）",
  "tags": ["関連するタグを3-5個"]
}

トピック: ${topic}
質問は具体的で実践的な内容にしてください。
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const questionData = JSON.parse(text);
      
      // 質問を保存
      const question = await Question.create({
        ...questionData,
        author: req.user._id,
        isAIGenerated: true,
      });

      res.status(201).json(question);
    } catch (error) {
      res.status(400).json({ message: 'AIの出力を解析できませんでした' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AIによる回答生成
// @route   POST /api/ai/generate-answer/:questionId
// @access  Private
export const generateAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const questionId = req.params.questionId;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: '質問が見つかりません' });
    }

    const model = getGeminiModel();

    const prompt = `
以下の質問に対する回答を生成してください：

タイトル: ${question.title}
内容: ${question.content}
タグ: ${question.tags.join(', ')}

回答は以下の要件を満たすようにしてください：
- 具体的で実践的なアドバイスを含める
- 科学的な根拠がある場合は言及する
- 安全面への配慮を含める
- 500文字程度で簡潔にまとめる

回答は以下の形式で出力してください：
{
  "content": "回答の内容"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const answerData = JSON.parse(text);

      // 回答を保存
      const answer = await Answer.create({
        content: answerData.content,
        author: req.user._id,
        question: questionId,
        isAIGenerated: true,
      });

      res.status(201).json(answer);
    } catch (error) {
      res.status(400).json({ message: 'AIの出力を解析できませんでした' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AIによる回答の評価
// @route   POST /api/ai/evaluate-answer/:answerId
// @access  Private
export const evaluateAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const answerId = req.params.answerId;
    const answer = await Answer.findById(answerId).populate('question');

    if (!answer) {
      return res.status(404).json({ message: '回答が見つかりません' });
    }

    const model = getGeminiModel();

    const prompt = `
以下の質問と回答のペアを評価してください：

質問:
タイトル: ${(answer.question as any).title}
内容: ${(answer.question as any).content}

回答:
${answer.content}

以下の観点で評価し、JSON形式で出力してください：
{
  "score": 1-10の評価点数,
  "strengths": ["良い点を3つ程度"],
  "weaknesses": ["改善点を3つ程度"],
  "suggestion": "改善のためのアドバイス"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const evaluation = JSON.parse(text);
      res.json(evaluation);
    } catch (error) {
      res.status(400).json({ message: 'AIの出力を解析できませんでした' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 