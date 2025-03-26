const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white p-6 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">トレーニング掲示板</h3>
            <p className="text-gray-300">
              マラソンを中心とする市民ランナーを対象としたトレーニングに関する疑問や質問を解決、共有するサービスです。
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">リンク</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white">
                  ホーム
                </a>
              </li>
              <li>
                <a href="/questions" className="text-gray-300 hover:text-white">
                  質問一覧
                </a>
              </li>
              <li>
                <a href="/auth/register" className="text-gray-300 hover:text-white">
                  新規登録
                </a>
              </li>
              <li>
                <a href="/auth/signin" className="text-gray-300 hover:text-white">
                  ログイン
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">お問い合わせ</h3>
            <p className="text-gray-300">
              ご質問やフィードバックがありましたら、お気軽にお問い合わせください。
            </p>
            <p className="text-gray-300 mt-2">
              Email: info@example.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} トレーニング掲示板. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 