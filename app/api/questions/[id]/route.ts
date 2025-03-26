import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import Question from "@/app/models/Question";
import Answer from "@/app/models/Answer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 質問の詳細を取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const questionId = await params.id;
    
    const question = await Question.findById(questionId)
      .populate("user", "name")
      .lean();
    
    if (!question) {
      return NextResponse.json(
        { error: "質問が見つかりません" },
        { status: 404 }
      );
    }
    
    // 関連する回答も取得
    const answers = await Answer.find({ question: questionId })
      .populate("user", "name")
      .sort("-upvotes") // 評価の高い順
      .lean();
    
    return NextResponse.json({
      question,
      answers,
    });
  } catch (error: any) {
    console.error("質問取得エラー:", error);
    return NextResponse.json(
      { error: error.message || "質問の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 質問を更新
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
    
    const questionId = params.id;
    const { title, content, tags } = await req.json();
    
    await connectToDatabase();
    
    const question = await Question.findById(questionId);
    
    if (!question) {
      return NextResponse.json(
        { error: "質問が見つかりません" },
        { status: 404 }
      );
    }
    
    // 権限チェック
    if (question.user.toString() !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "この操作を行う権限がありません" },
        { status: 403 }
      );
    }
    
    // 更新
    question.title = title || question.title;
    question.content = content || question.content;
    question.tags = tags || question.tags;
    
    await question.save();
    
    return NextResponse.json({
      message: "質問が更新されました",
      question,
    });
  } catch (error) {
    console.error("質問更新エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 質問を削除
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
    
    const questionId = params.id;
    
    await connectToDatabase();
    
    const question = await Question.findById(questionId);
    
    if (!question) {
      return NextResponse.json(
        { error: "質問が見つかりません" },
        { status: 404 }
      );
    }
    
    // 権限チェック
    if (question.user.toString() !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "この操作を行う権限がありません" },
        { status: 403 }
      );
    }
    
    // 関連する回答も削除
    await Answer.deleteMany({ question: questionId });
    
    // 質問を削除
    await Question.findByIdAndDelete(questionId);
    
    return NextResponse.json({
      message: "質問と関連する回答が削除されました",
    });
  } catch (error) {
    console.error("質問削除エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 