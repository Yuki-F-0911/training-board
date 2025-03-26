'use client';

import { useParams } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  
  return <ProfileClient id={id} />;
} 