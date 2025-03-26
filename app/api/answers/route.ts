import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import Answer from "@/app/models/Answer";
import Question from "@/app/models/Question";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 回答を投稿
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }
    
    const { content, questionId, isAIGenerated = false } = await req.json();
    
    if (!content || !questionId) {
      return NextResponse.json(
        { error: "内容と質問IDは必須です" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // 質問の存在確認
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json(
        { error: "指定された質問が見つかりません" },
        { status: 404 }
      );
    }
    
    const newAnswer = new Answer({
      content,
      user: session.user.id,
      question: questionId,
      isAIGenerated,
    });
    
    await newAnswer.save();
    
    return NextResponse.json(
      { message: "回答が投稿されました", answerId: newAnswer._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("回答投稿エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 