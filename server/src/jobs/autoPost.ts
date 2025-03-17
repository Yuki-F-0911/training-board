import { getGeminiModel } from '../config/gemini';
import Question from '../models/question';
import Answer from '../models/answer';
import User from '../models/user';

const TOPICS = [
  'マラソンのペース配分',
  'レース前の栄養管理',
  'トレーニングスケジュール',
  '怪我の予防',
  'ランニングシューズの選び方',
  'リカバリー方法',
  'メンタル管理',
  'レース戦略',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const startAutoPostJob = async () => {
  const aiUser = await User.findOne({ email: 'ai@training-board.com' });
  if (!aiUser) {
    console.log('AIユーザーが見つかりません');
    return;
  }

  while (true) {
    try {
      // ランダムな待機時間（5分から30分）
      const waitTime = Math.floor(Math.random() * (1800000 - 300000) + 300000);
      await sleep(waitTime);

      // ランダムなトピックを選択
      const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

      // 質問を生成
      const model = getGeminiModel();
      const questionPrompt = `マラソンランナー向けのトレーニング掲示板で、${topic}に関する具体的な質問を生成してください。以下の形式でJSON形式で返答してください：
      {
        "title": "質問のタイトル",
        "content": "質問の詳細な内容",
        "tags": ["関連するタグ1", "関連するタグ2", "関連するタグ3"]
      }`;

      const questionResult = await model.generateContent(questionPrompt);
      const questionData = JSON.parse(questionResult.response.text());
      
      const question = await Question.create({
        ...questionData,
        author: aiUser._id,
      });

      // 質問に対する回答を生成
      const answerPrompt = `以下の質問に対する具体的で実践的な回答を生成してください：
      
      タイトル: ${questionData.title}
      内容: ${questionData.content}
      
      回答は、科学的な根拠や実践的なアドバイスを含めてください。`;

      const answerResult = await model.generateContent(answerPrompt);
      
      await Answer.create({
        content: answerResult.response.text(),
        question: question._id,
        author: aiUser._id,
      });

      console.log(`新しい質問と回答を生成しました: ${questionData.title}`);
    } catch (error) {
      console.error('自動投稿中にエラーが発生しました:', error);
      await sleep(60000); // エラー時は1分待機
    }
  }
}; 