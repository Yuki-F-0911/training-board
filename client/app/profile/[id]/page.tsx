import { Suspense } from 'react';
import ProfileContent from './ProfileContent';

export default function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ProfileContent id={params.id} />
    </Suspense>
  );
} 