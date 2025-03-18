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
  withCredentials: false, // CORSの'*'設定と一致させる
});

// クライアント側でLocalStorageからトークンを取得して設定
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// インターセプターを追加して、リクエスト前に毎回トークンを設定
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient; 