'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface QuestionFormProps {
  initialData?: {
    title: string;
    content: string;
    tags: string[];
  };
  isEditing?: boolean;
  questionId?: string;
}

const QuestionForm = ({ initialData, isEditing = false, questionId }: QuestionFormProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('質問を投稿するにはログインが必要です');
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      setError('タイトルと内容は必須です');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const tagsArray = tags
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];
      
      const url = isEditing
        ? `/api/questions/${questionId}`
        : '/api/questions';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          tags: tagsArray,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '質問の投稿に失敗しました');
      }
      
      const data = await response.json();
      const redirectUrl = isEditing
        ? `/questions/${questionId}`
        : `/questions/${data.questionId}`;
      
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('質問投稿エラー:', err);
      setError(err.message || '質問の投稿中にエラーが発生しました');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
          タイトル *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="質問のタイトルを入力してください"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
          内容 *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
          placeholder="質問の詳細を入力してください"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div>
        <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
          タグ（カンマ区切りで入力）
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: マラソン, トレーニング, 初心者"
          disabled={isSubmitting}
        />
        <p className="text-gray-500 text-sm mt-1">
          関連するタグをカンマ（,）区切りで入力してください
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isEditing ? '更新中...' : '投稿中...'
            : isEditing ? '質問を更新' : '質問を投稿'
          }
        </button>
      </div>
    </form>
  );
};

export default QuestionForm; 