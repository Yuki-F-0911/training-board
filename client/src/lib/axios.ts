'use client'

import axios from 'axios';

// 環境変数からAPIのベースURLを取得するか、デフォルト値を使用
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('API URL設定:', baseURL);

// axiosインスタンスの作成
const api = axios.create({
  baseURL,
  timeout: 10000, // タイムアウト10秒
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CORSリクエストでCookieを送信する
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    // ブラウザ環境の場合のみローカルストレージからトークンを取得
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`トークンを設定しました: ${config.url}`);
      } else {
        console.log(`No token available for request to: ${config.url}`);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('APIリクエストエラー:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    console.log(`API成功: ${response.config?.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    
    // 認証エラーの場合
    if (status === 401) {
      console.log('Authentication error detected, clearing token');
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      
      // 認証関連でないパスの場合にのみログインページへ遷移
      const requestURL = error.config?.url;
      if (requestURL && !requestURL.includes('/auth/')) {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          // ページ遷移についてはuseAuthに任せるため、ここでは行わない
        }
      }
    }
    
    console.error(`API Error: ${error.config?.url} Status: ${status} Data:`, data || {});
    
    return Promise.reject(error);
  }
);

export default api; 