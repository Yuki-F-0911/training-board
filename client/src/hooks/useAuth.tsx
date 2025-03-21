import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../lib/axios';
import { useRouter } from 'next/navigation';

export interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkUserAuthentication: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // アプリ起動時に認証状態をチェック
  useEffect(() => {
    console.log('AuthProvider: 初期認証チェック実行');
    checkUserAuthentication()
      .then((authenticated) => {
        setLoading(false);
        console.log('AuthProvider: 初期認証チェック完了', authenticated ? '認証済み' : '未認証');
      })
      .catch((error) => {
        console.error('AuthProvider: 初期認証チェックエラー', error);
        setLoading(false);
      });
  }, []);

  // ユーザー認証状態のチェック
  const checkUserAuthentication = async (): Promise<boolean> => {
    console.log('checkUserAuthentication: 認証状態チェック開始');
    
    try {
      // ローカルストレージからトークンを取得
      let token = null;
      if (typeof window !== 'undefined') {
        try {
          token = localStorage.getItem('token');
          console.log('トークン存在確認:', token ? 'トークンあり' : 'トークンなし');
          
          if (token) {
            // ヘッダーに明示的にトークンを設定
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('トークンをヘッダーに設定:', token.substring(0, 10) + '...');
          }
        } catch (e) {
          console.error('localStorage アクセスエラー:', e);
        }
      }
      
      // トークンがない場合は未認証
      if (!token) {
        console.log('checkUserAuthentication: トークンなし - 未認証');
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
      
      // トークンがある場合はユーザー情報を取得
      const authenticated = await fetchUser();
      return authenticated;
    } catch (error) {
      console.error('checkUserAuthentication エラー:', error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // ユーザー情報の取得
  const fetchUser = async (): Promise<boolean> => {
    console.log('fetchUser: ユーザー情報取得開始');
    try {
      const response = await apiClient.get('/auth/me');
      console.log('fetchUser: ユーザー情報取得成功', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error('fetchUser エラー:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data
        } : error.message
      );
      
      // 401エラーの場合はトークンクリア
      if (error.response && error.response.status === 401) {
        console.log('認証エラー: トークンをクリア');
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('token');
          } catch (e) {
            console.error('localStorage トークン削除エラー:', e);
          }
        }
        delete apiClient.defaults.headers.common['Authorization'];
      }
      
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // ログイン
  const login = async (email: string, password: string): Promise<void> => {
    console.log(`login: ログイン試行 - ${email}`);
    setLoading(true);
    
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('login: ログイン成功', response.data);
      
      // レスポンスからユーザー情報とトークンを取得
      const { user, token } = response.data;
      
      if (!token) {
        throw new Error('サーバーからトークンが返されていません');
      }
      
      // トークンをローカルストレージに保存
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('token', token);
          console.log('login: トークン保存成功', token.substring(0, 10) + '...');
        } catch (e) {
          console.error('login: localStorage トークン保存エラー:', e);
        }
      }
      
      // ヘッダーにトークンを設定
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('login: Authorizationヘッダーに設定完了');
      
      // ユーザー情報を直接設定（fetchUser不要）
      setUser(user);
      setIsAuthenticated(true);
      setLoading(false);
      
      // ログイン後にホームページにリダイレクト
      router.push('/');
    } catch (error: any) {
      console.error('login エラー:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data
        } : error.message
      );
      setLoading(false);
      throw error;
    }
  };

  // 新規登録
  const register = async (username: string, email: string, password: string): Promise<void> => {
    console.log(`register: 新規登録試行 - ${email}`);
    setLoading(true);
    
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      console.log('register: 登録成功', response.data);
      
      // レスポンスからユーザー情報とトークンを取得
      const { user, token } = response.data;
      
      if (!token) {
        throw new Error('サーバーからトークンが返されていません');
      }
      
      // トークンをローカルストレージに保存
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('token', token);
          console.log('register: トークン保存成功', token.substring(0, 10) + '...');
        } catch (e) {
          console.error('register: localStorage トークン保存エラー:', e);
        }
      }
      
      // ヘッダーにトークンを設定
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('register: Authorizationヘッダーに設定完了');
      
      // ユーザー情報を直接設定（fetchUser不要）
      setUser(user);
      setIsAuthenticated(true);
      setLoading(false);
      
      // 登録後にホームページにリダイレクト
      router.push('/');
    } catch (error: any) {
      console.error('register エラー:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data
        } : error.message
      );
      setLoading(false);
      throw error;
    }
  };

  // ログアウト
  const logout = (): void => {
    console.log('logout: ログアウト実行');
    
    // ローカルストレージからトークンを削除
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token');
        console.log('logout: トークン削除成功');
      } catch (e) {
        console.error('logout: localStorage トークン削除エラー:', e);
      }
    }
    
    // 認証ヘッダーを削除
    delete apiClient.defaults.headers.common['Authorization'];
    
    // ユーザー情報をクリア
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkUserAuthentication
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 