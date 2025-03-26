import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import Answer from "@/app/models/Answer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 回答の詳細を取得
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const answerId = params.id;
    
    const answer = await Answer.findById(answerId)
      .populate("user", "name")
      .populate("question", "title")
      .lean();
    
    if (!answer) {
      return NextResponse.json(
        { error: "回答が見つかりません" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("回答詳細取得エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 回答を更新
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }
    
    const answerId = params.id;
    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json(
        { error: "内容は必須です" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const answer = await Answer.findById(answerId);
    
    if (!answer) {
      return NextResponse.json(
        { error: "回答が見つかりません" },
        { status: 404 }
      );
    }
    
    // 権限チェック
    if (answer.user.toString() !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "この操作を行う権限がありません" },
        { status: 403 }
      );
    }
    
    // 更新
    answer.content = content;
    
    await answer.save();
    
    return NextResponse.json({
      message: "回答が更新されました",
      answer,
    });
  } catch (error) {
    console.error("回答更新エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 回答を削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }
    
    const answerId = params.id;
    
    await connectToDatabase();
    
    const answer = await Answer.findById(answerId);
    
    if (!answer) {
      return NextResponse.json(
        { error: "回答が見つかりません" },
        { status: 404 }
      );
    }
    
    // 権限チェック
    if (answer.user.toString() !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "この操作を行う権限がありません" },
        { status: 403 }
      );
    }
    
    // 回答を削除
    await Answer.findByIdAndDelete(answerId);
    
    return NextResponse.json({
      message: "回答が削除されました",
    });
  } catch (error) {
    console.error("回答削除エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 