import axios from 'axios';

// 環境変数が取得できていない場合に備えて、本番環境のURLを明示的に指定
const API_URL = 
  process.env.NODE_ENV === 'production' 
    ? 'https://training-board-server.vercel.app/api' 
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

export default apiClient; 