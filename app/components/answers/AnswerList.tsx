'use client';

import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState } from 'react';
import Link from 'next/link';

interface AnswerListProps {
  answers: any[];
  questionId: string;
  onAnswerUpdate: (answer: any) => void;
  onAnswerDelete: (answerId: string) => void;
}

const AnswerList = ({ answers, questionId, onAnswerUpdate, onAnswerDelete }: AnswerListProps) => {
  const { data: session } = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [userRatings, setUserRatings] = useState<{ [key: string]: number | null }>({});

  if (!answers || answers.length === 0) {
    return <div className="text-gray-500 text-center py-8">まだ回答がありません。最初の回答を投稿しましょう！</div>;
  }

  const handleEdit = (answer: any) => {
    setEditingId(answer._id);
    setEditContent(answer.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (answerId: string) => {
    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '回答の更新に失敗しました');
      }

      const data = await response.json();
      onAnswerUpdate(data.answer);
      setEditingId(null);
      setEditContent('');
    } catch (err: any) {
      console.error('回答更新エラー:', err);
      alert(err.message || '回答の更新中にエラーが発生しました');
    }
  };

  const handleDelete = async (answerId: string) => {
    if (!confirm('この回答を削除してもよろしいですか？この操作は取り消せません。')) {
      return;
    }

    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '回答の削除に失敗しました');
      }

      onAnswerDelete(answerId);
    } catch (err: any) {
      console.error('回答削除エラー:', err);
      alert(err.message || '回答の削除中にエラーが発生しました');
    }
  };

  const handleRating = async (answerId: string, value: number) => {
    if (!session) {
      alert('評価するにはログインが必要です');
      return;
    }
    
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'answer',
          targetId: answerId,
          value: value,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '評価の送信に失敗しました');
      }
      
      // 成功したら回答を更新
      const updatedResponse = await fetch(`/api/questions/${questionId}`);
      const updatedData = await updatedResponse.json();
      const updatedAnswer = updatedData.answers.find((a: any) => a._id === answerId);
      onAnswerUpdate(updatedAnswer);
      
      // ユーザーの評価状態を更新
      setUserRatings(prev => ({
        ...prev,
        [answerId]: prev[answerId] === value ? null : value
      }));
    } catch (err: any) {
      console.error('評価エラー:', err);
      alert(err.message || '評価の送信中にエラーが発生しました');
    }
  };

  return (
    <div className="space-y-6">
      {answers.map((answer) => {
        const createdAt = new Date(answer.createdAt);
        const timeAgo = formatDistanceToNow(createdAt, { locale: ja, addSuffix: true });
        const userRating = userRatings[answer._id] || null;
        const isOwner = session?.user?.id === answer.user?._id;

        return (
          <div key={answer._id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="prose max-w-none mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">{answer.content}</p>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRating(answer._id, 1)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                      userRating === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{answer.upvotes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleRating(answer._id, -1)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                      userRating === -1
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{answer.downvotes}</span>
                  </button>
                </div>
                <span className="text-gray-600">回答者: {answer.user?.name || '不明'}</span>
                {answer.isAIGenerated && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                    AI生成
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{timeAgo}</span>
                {isOwner && (
                  <div className="flex gap-2">
                    <Link 
                      href={`/answers/${answer._id}/edit`}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:border-blue-800"
                    >
                      編集
                    </Link>
                    <button 
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:border-red-800"
                      onClick={() => handleDelete(answer._id)}
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnswerList; 