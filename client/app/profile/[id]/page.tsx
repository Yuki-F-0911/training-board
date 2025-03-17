import { Suspense } from 'react';
import ProfileContent from './ProfileContent';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ProfilePage({ params }: Props) {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ProfileContent id={params.id} />
    </Suspense>
  );
} 