import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongoose';
import Question from '@/app/models/Question';
import Answer from '@/app/models/Answer';

export async function POST(request: Request) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // ランダムな質問を取得
    const randomQuestion = await Question.findOne().sort({ createdAt: -1 });
    
    // AIによる質問生成
    const questionResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'question' }),
    });

    if (!questionResponse.ok) {
      throw new Error('AIによる質問生成に失敗しました');
    }

    const questionData = await questionResponse.json();
    
    // 質問を保存
    const newQuestion = await Question.create({
      ...questionData,
      user: {
        _id: 'ai-system',
        name: `AI-${questionData.personality}`,
      },
    });

    // 既存の質問に対するAI回答の生成
    if (randomQuestion) {
      const answerResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'answer',
          questionId: randomQuestion._id,
        }),
      });

      if (answerResponse.ok) {
        const answerData = await answerResponse.json();
        
        // 回答を保存
        await Answer.create({
          ...answerData,
          question: randomQuestion._id,
          user: {
            _id: 'ai-system',
            name: `AI-${answerData.personality}`,
          },
        });
      }
    }

    return NextResponse.json({
      message: 'AIによる質問と回答の生成が完了しました',
      questionId: newQuestion._id,
    });

  } catch (error: any) {
    console.error('AI自動生成エラー:', error);
    return NextResponse.json(
      { error: error.message || 'AIによる自動生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 