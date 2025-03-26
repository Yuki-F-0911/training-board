import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import Rating from "@/app/models/Rating";
import Question from "@/app/models/Question";
import Answer from "@/app/models/Answer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 評価を送信
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }
    
    const { type, targetId, value } = await req.json();
    
    if (!type || !targetId || value === undefined) {
      return NextResponse.json(
        { error: "タイプ、対象ID、評価値は必須です" },
        { status: 400 }
      );
    }
    
    if (type !== "question" && type !== "answer") {
      return NextResponse.json(
        { error: "タイプは'question'または'answer'である必要があります" },
        { status: 400 }
      );
    }
    
    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: "評価値は1または-1である必要があります" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // 対象の存在確認
    let target;
    if (type === "question") {
      target = await Question.findById(targetId);
    } else {
      target = await Answer.findById(targetId);
    }
    
    if (!target) {
      return NextResponse.json(
        { error: "対象が見つかりません" },
        { status: 404 }
      );
    }
    
    // 既存の評価を確認
    const existingRating = await Rating.findOne({
      user: session.user.id,
      type,
      targetId,
    });
    
    if (existingRating) {
      // 既存の評価を更新
      if (existingRating.value === value) {
        // 同じ値なら評価を削除（取り消し）
        await Rating.findByIdAndDelete(existingRating._id);
        
        // 対象の評価カウントを更新
        if (value === 1) {
          target.upvotes = Math.max(0, target.upvotes - 1);
        } else {
          target.downvotes = Math.max(0, target.downvotes - 1);
        }
        
        await target.save();
        
        return NextResponse.json({
          message: "評価が取り消されました",
        });
      } else {
        // 反対の値なら評価を更新
        existingRating.value = value;
        await existingRating.save();
        
        // 対象の評価カウントを更新
        if (value === 1) {
          target.upvotes += 1;
          target.downvotes = Math.max(0, target.downvotes - 1);
        } else {
          target.downvotes += 1;
          target.upvotes = Math.max(0, target.upvotes - 1);
        }
        
        await target.save();
        
        return NextResponse.json({
          message: "評価が更新されました",
        });
      }
    } else {
      // 新しい評価を作成
      const newRating = new Rating({
        user: session.user.id,
        type,
        targetId,
        value,
      });
      
      await newRating.save();
      
      // 対象の評価カウントを更新
      if (value === 1) {
        target.upvotes += 1;
      } else {
        target.downvotes += 1;
      }
      
      await target.save();
      
      return NextResponse.json(
        { message: "評価が送信されました" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("評価送信エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 