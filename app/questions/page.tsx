import QuestionList from '@/app/components/questions/QuestionList';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '質問一覧 | トレーニング掲示板',
  description: 'マラソンを中心とする市民ランナーのトレーニングに関する質問一覧',
};

export default function QuestionsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">質問一覧</h1>
        <Link
          href="/questions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          質問する
        </Link>
      </div>
      
      <QuestionList />
    </div>
  );
} 