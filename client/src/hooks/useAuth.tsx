'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // アプリ初期化時にユーザー情報を取得
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('初期化時にトークンがありません');
          setIsLoading(false);
          return;
        }
        
        // APIクライアントにトークンを設定
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('トークンを設定しました:', token);
        
        const response = await api.get('/auth/me');
        
        if (response.data && response.data.user) {
          console.log('認証済みユーザー情報を取得しました:', response.data.user);
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('認証チェックエラー:', error);
        // エラー時はトークンをクリア
        localStorage.removeItem('token');
        api.defaults.headers.common['Authorization'] = '';
        console.log('Authentication error detected, clearing token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log(`ログイン試行: ${email}`);
      setIsLoading(true);
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('ログインレスポンス:', response.data);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        console.log('ログイン成功、トークンを保存:', response.data.token);
        
        if (response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          console.log('ユーザー情報をセット:', response.data.user);
        } else {
          // ユーザー情報がレスポンスに含まれていない場合は取得
          try {
            const userResponse = await api.get('/auth/me');
            setUser(userResponse.data.user);
            setIsAuthenticated(true);
            console.log('追加でユーザー情報を取得:', userResponse.data.user);
          } catch (userError) {
            console.error('ユーザー情報取得エラー:', userError);
          }
        }
        
        toast({
          title: 'ログイン成功',
          description: 'ようこそ！',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // ホームページにリダイレクト
        router.push('/');
      }
    } catch (error: any) {
      console.error('ログインエラー:', error);
      toast({
        title: 'ログイン失敗',
        description: error.response?.data?.message || 'ログインに失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      console.log(`登録試行: ${email}`);
      
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      
      console.log('登録レスポンス:', response.data);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        console.log('登録成功、トークンを保存:', response.data.token);
        
        if (response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          console.log('ユーザー情報をセット:', response.data.user);
        }
        
        toast({
          title: '登録成功',
          description: 'アカウントが作成されました。',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // ホームページにリダイレクト
        router.push('/');
      }
    } catch (error: any) {
      console.error('登録エラー:', error);
      toast({
        title: '登録失敗',
        description: error.response?.data?.message || '登録に失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('ログアウト完了');
    
    toast({
      title: 'ログアウト',
      description: 'ログアウトしました。',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
    
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 