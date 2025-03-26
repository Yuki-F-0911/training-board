'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AnswerFormProps {
  questionId: string;
  onAnswerSubmit: (answer: any) => void;
}

const AnswerForm = ({ questionId, onAnswerSubmit }: AnswerFormProps) => {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('回答内容を入力してください');
      return;
    }
    
    if (!session) {
      setError('回答するにはログインが必要です');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          questionId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '回答の投稿に失敗しました');
      }
      
      const data = await response.json();
      
      // 回答詳細を取得して親コンポーネントに渡す
      const answerResponse = await fetch(`/api/answers/${data.answerId}`);
      const answerData = await answerResponse.json();
      
      onAnswerSubmit(answerData.answer);
      setContent('');
    } catch (err: any) {
      console.error('回答投稿エラー:', err);
      setError(err.message || '回答の投稿中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          回答内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px] text-gray-800"
          placeholder="回答内容を入力してください"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-lg text-white ${
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? '投稿中...' : '回答を投稿'}
        </button>
      </div>
    </form>
  );
};

export default AnswerForm; 