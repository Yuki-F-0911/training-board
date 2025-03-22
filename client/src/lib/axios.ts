'use client'

import axios from 'axios';

const API_URL = 'https://training-board-server.vercel.app/api';

console.log('API URL設定:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CORS認証のためにクレデンシャルを含める
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター - ヘッダーにトークンを追加
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('リクエストにトークンを追加:', config.url);
    } else {
      console.log(`No token available for request to: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('APIリクエストエラー:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター - エラーハンドリング
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(`API Error: ${error.config?.url} Status: ${error.response.status} Data:`, error.response.data);
      
      // 401エラーの場合はトークンをクリア
      if (error.response.status === 401) {
        console.log('Authentication error detected, clearing token');
        localStorage.removeItem('token');
      }
    } else if (error.request) {
      console.log('API Error: No response received', error.request);
    } else {
      console.log('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient; 