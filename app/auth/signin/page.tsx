import LoginForm from '@/app/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン | トレーニング掲示板',
  description: 'トレーニング掲示板にログインしてください',
};

export default function SignInPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-8">アカウントにログイン</h1>
      <LoginForm />
    </div>
  );
} 