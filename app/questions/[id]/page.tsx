import { Metadata } from 'next';
import QuestionDetail from '@/app/components/questions/QuestionDetail';

interface Props {
  params: {
    id: string;
  };
}

// メタデータを動的に生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/questions/${await params.id}`, {
      cache: 'no-store',
    });
    const data = await response.json();
    return {
      title: data.question.title,
      description: data.question.content.substring(0, 160),
    };
  } catch (error) {
    return {
      title: '質問詳細',
      description: '質問の詳細ページです',
    };
  }
}

export default async function QuestionPage({ params }: Props) {
  return (
    <div className="space-y-8">
      <QuestionDetail questionId={await params.id} />
    </div>
  );
} 