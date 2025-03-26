'use client';

import { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import { useRouter, useSearchParams } from 'next/navigation';

const QuestionList = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError('');
        
        let url = `/api/questions?page=${page}&limit=${limit}&sort=${sort}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('質問の取得に失敗しました');
        }
        
        const data = await response.json();
        setQuestions(data.questions || []);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        console.error('質問一覧取得エラー:', err);
        setError(err.message || '質問の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [page, limit, sort, search]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/questions?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    params.set('page', '1'); // ソート変更時は1ページ目に戻る
    router.push(`/questions?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // 検索時は1ページ目に戻る
    router.push(`/questions?${params.toString()}`);
  };

  if (loading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        エラー: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <form onSubmit={handleSearch} className="flex w-full md:w-auto">
          <input
            type="text"
            name="search"
            placeholder="質問を検索..."
            defaultValue={search}
            className="px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
          >
            検索
          </button>
        </form>
        
        <div className="flex items-center">
          <label htmlFor="sort" className="text-gray-700 mr-2">
            並び替え:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={handleSortChange}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="-createdAt">新しい順</option>
            <option value="createdAt">古い順</option>
            <option value="-upvotes">評価の高い順</option>
            <option value="title">タイトル順</option>
          </select>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">質問が見つかりません</p>
          {search && (
            <p className="mt-2 text-gray-500">検索条件: &quot;{search}&quot;</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question: any) => (
            question && <QuestionCard key={question._id || `question-${Math.random()}`} question={question} />
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 rounded border enabled:hover:bg-gray-100 disabled:opacity-50"
            >
              前へ
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded ${
                  pageNum === page
                    ? 'bg-blue-600 text-white'
                    : 'border hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border enabled:hover:bg-gray-100 disabled:opacity-50"
            >
              次へ
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default QuestionList; 