import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const personalities = [
  {
    name: '市民ランナー',
    prompt: 'あなたは一般の市民ランナーです。マラソンやランニングに関する質問に、一般ランナーの視点から回答してください。',
  },
  {
    name: '専門家',
    prompt: 'あなたはランニングの専門家です。科学的な根拠に基づいて、マラソンやランニングに関する質問に回答してください。',
  },
  {
    name: 'BACKAGINGトレーナー',
    prompt: 'あなたはBACKAGINGジムのトレーナーです。実践的なアドバイスと、ジムでのトレーニング経験に基づいて回答してください。',
  },
];

export async function POST(request: Request) {
  try {
    const { type, questionId } = await request.json();
    
    if (!type) {
      return NextResponse.json(
        { error: 'タイプを指定してください' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const personality = personalities[Math.floor(Math.random() * personalities.length)];

    let prompt = '';
    let response;

    if (type === 'question') {
      prompt = `${personality.prompt}
以下のような質問を生成してください：
- マラソンやランニングに関する質問
- 具体的で実践的な内容
- 一般のランナーが抱える疑問や悩み
- タイトルと本文を分けて出力

出力形式：
タイトル：[タイトル]
本文：[本文]`;
    } else if (type === 'answer' && questionId) {
      // 質問の内容を取得
      const questionResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/questions/${questionId}`);
      const questionData = await questionResponse.json();
      
      prompt = `${personality.prompt}
以下の質問に対して、専門的な視点から回答を生成してください：

質問タイトル：${questionData.question.title}
質問内容：${questionData.question.content}

回答は具体的で実用的な内容にしてください。`;
    }

    response = await model.generateContent(prompt);
    const result = await response.response;
    const text = result.text();

    if (type === 'question') {
      // タイトルと本文を分離
      const titleMatch = text.match(/タイトル：(.+)/);
      const contentMatch = text.match(/本文：(.+)/s);
      
      if (!titleMatch || !contentMatch) {
        throw new Error('AIの応答形式が不正です');
      }

      return NextResponse.json({
        title: titleMatch[1].trim(),
        content: contentMatch[1].trim(),
        isAIGenerated: true,
        personality: personality.name,
      });
    } else if (type === 'answer') {
      return NextResponse.json({
        content: text.trim(),
        isAIGenerated: true,
        personality: personality.name,
      });
    }

  } catch (error: any) {
    console.error('AI生成エラー:', error);
    return NextResponse.json(
      { error: error.message || 'AIの応答生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 