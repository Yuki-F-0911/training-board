'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          トレーニング掲示板
        </Link>

        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:underline">
                ホーム
              </Link>
            </li>
            <li>
              <Link href="/questions" className="hover:underline">
                質問一覧
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link href="/questions/new" className="hover:underline">
                    質問する
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:underline">
                    マイページ
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="hover:underline"
                  >
                    ログアウト
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/auth/signin" className="hover:underline">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:underline">
                    新規登録
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 