'use client';

import { Suspense } from 'react';
import QuestionsContent from './QuestionsContent';

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <QuestionsContent />
    </Suspense>
  );
} 