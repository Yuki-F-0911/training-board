import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import QuestionForm from '@/app/components/questions/QuestionForm';

export const metadata: Metadata = {
  title: '新しい質問を投稿 | トレーニング掲示板',
  description: 'マラソントレーニングに関する新しい質問を投稿する',
};

export default async function NewQuestionPage() {
  const session = await getServerSession(authOptions);
  
  // 認証されていない場合はログインページにリダイレクト
  if (!session) {
    redirect('/auth/signin?callbackUrl=/questions/new');
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">新しい質問を投稿</h1>
      <QuestionForm />
    </div>
  );
} 