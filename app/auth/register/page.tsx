import RegisterForm from '@/app/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '新規登録 | トレーニング掲示板',
  description: 'トレーニング掲示板に新規登録',
};

export default function RegisterPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-8">アカウント作成</h1>
      <RegisterForm />
    </div>
  );
} 