import axios from 'axios';

// 環境変数が取得できていない場合に備えて、本番環境のURLを明示的に指定
const API_URL = 
  process.env.NODE_ENV === 'production' 
    ? 'https://training-board-server.vercel.app/api' 
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('API URL設定:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // CORSの'*'設定と一致させる
  timeout: 10000 // 10秒タイムアウト
});

// クライアント側でLocalStorageからトークンを取得して設定
if (typeof window !== 'undefined') {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('初期化時にトークンを設定:', token.substring(0, 10) + '...');
    } else {
      console.log('初期化時にトークンがありません');
    }
  } catch (e) {
    console.error('トークン初期化エラー:', e);
  }
}

// インターセプターを追加して、リクエスト前に毎回トークンを設定
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('Request with token to:', config.url);
        } else {
          console.log('No token available for request to:', config.url);
        }
      } catch (e) {
        console.error('リクエストトークン設定エラー:', e);
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプターを追加して、認証エラーをキャッチ
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    // エラーオブジェクトの安全な取り出し
    const status = error.response ? error.response.status : 'unknown';
    const url = error.config ? error.config.url : 'unknown';
    const data = error.response && error.response.data ? error.response.data : {};
    
    // 詳細なエラーログ
    console.error(
      'API Error:', 
      url, 
      'Status:', status, 
      'Data:', JSON.stringify(data)
    );
    
    // 401エラーの場合はトークンが無効な可能性がある
    if (status === 401) {
      console.log('Authentication error detected, clearing token');
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('token');
        } catch (e) {
          console.error('トークン削除エラー:', e);
        }
      }
      delete apiClient.defaults.headers.common['Authorization'];
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 