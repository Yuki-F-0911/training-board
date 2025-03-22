'use client'

import axios from 'axios';

// APIの設定
const API_URL = 'https://training-board-server.vercel.app/api';

console.log('API URL設定:', API_URL);

// axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_URL,
  // CORSリクエストでクレデンシャルを送信しない
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  // タイムアウトを設定
  timeout: 15000,
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    try {
      // ローカルストレージからトークンを取得
      const token = localStorage.getItem('token');
      
      // CORS対策でヘッダーを明示的に設定
      config.headers = config.headers || {};
      config.headers['Content-Type'] = 'application/json';
      
      // トークンが存在する場合はAuthorizationヘッダーに設定
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`リクエスト送信: ${config.url} (認証あり)`);
      } else {
        console.log(`リクエスト送信: ${config.url} (認証なし)`);
      }
      
      return config;
    } catch (error) {
      console.error('リクエストエラー:', error);
      return config;
    }
  },
  (error) => {
    console.error('リクエスト準備エラー:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API成功 [${response.status}]: ${response.config.url}`);
    return response;
  },
  (error) => {
    // エラーの種類に応じた処理
    if (error.response) {
      // サーバーからのエラーレスポンス
      console.log(`API エラー [${error.response.status}]: ${error.config?.url}`, 
        error.response.data);
      
      // 401エラーの場合はトークンをクリア
      if (error.response.status === 401) {
        console.log('認証エラーを検出、トークンをクリア');
        localStorage.removeItem('token');
      }
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない（ネットワークエラーなど）
      console.log('ネットワークエラー: レスポンスなし', error.config?.url);
    } else {
      // リクエスト設定時のエラー
      console.log('APIリクエスト設定エラー:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 