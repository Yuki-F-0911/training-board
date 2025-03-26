'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import AnswerForm from '@/app/components/answers/AnswerForm';
import AnswerList from '@/app/components/answers/AnswerList';

interface QuestionDetailProps {
  questionId: string;
}

const QuestionDetail = ({ questionId }: QuestionDetailProps) => {
  const { data: session } = useSession();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuestionDetail = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`/api/questions/${questionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('質問が見つかりません');
          }
          throw new Error('質問の取得に失敗しました');
        }
        
        const data = await response.json();
        setQuestion(data.question);
        setAnswers(data.answers || []);
      } catch (err: any) {
        console.error('質問詳細取得エラー:', err);
        setError(err.message || '質問の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    if (questionId) {
      fetchQuestionDetail();
    }
  }, [questionId]);

  const handleRating = async (value: number) => {
    if (!session) {
      alert('評価するにはログインが必要です');
      return;
    }
    
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'question',
          targetId: questionId,
          value: value,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '評価の送信に失敗しました');
      }
      
      // 成功したら質問を再取得
      const updatedResponse = await fetch(`/api/questions/${questionId}`);
      const updatedData = await updatedResponse.json();
      setQuestion(updatedData.question);
      
      // ユーザーの評価状態を更新
      setUserRating(value === userRating ? null : value);
    } catch (err: any) {
      console.error('評価エラー:', err);
      alert(err.message || '評価の送信中にエラーが発生しました');
    }
  };

  const addNewAnswer = (answer: any) => {
    setAnswers([...answers, answer]);
  };

  if (loading) {
    return <div className="text-center py-12">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        エラー: {error}
      </div>
    );
  }

  if (!question) {
    return <div className="text-center py-12">質問が見つかりません</div>;
  }

  const createdAt = new Date(question.createdAt);
  const timeAgo = formatDistanceToNow(createdAt, { locale: ja, addSuffix: true });

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {question.answersCount} 回答
            </span>
            <span className="text-sm text-gray-600">
              {question.views} 閲覧
            </span>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-800 whitespace-pre-wrap">{question.content}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {question.tags && question.tags.map((tag: string, index: number) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>投稿者: {question.user?.name || '不明'}</span>
            {question.isAIGenerated && (
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                AI生成
              </span>
            )}
          </div>
          <span>{timeAgo}</span>
        </div>
        
        {session && session.user && (question.user?._id === session.user.id) && (
          <div className="mt-4 flex gap-2 justify-end">
            <Link 
              href={`/questions/${questionId}/edit`}
              className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:border-blue-800"
            >
              編集
            </Link>
            <button 
              className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:border-red-800"
              onClick={() => {
                if (confirm('この質問を削除してもよろしいですか？この操作は取り消せません。')) {
                  // 質問削除APIを呼び出し
                }
              }}
            >
              削除
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {answers.length > 0 ? `${answers.length}件の回答` : '回答がありません'}
        </h2>
        
        <AnswerList 
          answers={answers} 
          questionId={questionId}
          onAnswerUpdate={(updatedAnswer) => {
            setAnswers(answers.map(ans => 
              ans._id === updatedAnswer._id ? updatedAnswer : ans
            ));
          }}
          onAnswerDelete={(deletedId) => {
            setAnswers(answers.filter(ans => ans._id !== deletedId));
          }}
        />
      </div>
      
      {session && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">あなたの回答</h2>
          <AnswerForm 
            questionId={questionId} 
            onAnswerSubmit={addNewAnswer}
          />
        </div>
      )}
      
      {!session && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-3">回答するには<Link href="/auth/signin" className="text-blue-600 hover:underline">ログイン</Link>してください</p>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail; 