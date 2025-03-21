import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/axios';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (username: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('AuthProvider初期化');
    checkUserAuthentication();
  }, []);

  const checkUserAuthentication = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // デバッグログ追加
      console.log('保存されているトークン:', token ? `${token.substring(0, 10)}...` : 'なし');
      
      if (!token) {
        console.log('トークンがないため未認証状態');
        setLoading(false);
        return;
      }

      // トークンを設定
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('トークンをヘッダーに設定');
      
      await fetchUser();
    } catch (error) {
      console.error('認証チェックエラー:', error);
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      console.log('ユーザー情報取得リクエスト送信');
      const response = await apiClient.get('/auth/me');
      console.log('ユーザー情報取得成功:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      // トークンをクリア
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('ログインリクエスト送信:', email);
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      console.log('ログイン成功:', response.data);
      // トークンを保存
      const { token } = response.data;
      if (token) {
        console.log('トークンを保存:', token.substring(0, 10) + '...');
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await fetchUser();
        return response.data;
      } else {
        throw new Error('トークンが返されませんでした');
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('ユーザー登録リクエスト送信:', email);
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password,
      });
      console.log('ユーザー登録成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('登録エラー:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('ログアウト実行');
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 