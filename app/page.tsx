import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            トレーニング掲示板
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">トレーニング掲示板の特徴</h2>
            <div className="space-y-4 text-gray-800">
              <p className="leading-relaxed">
                マラソンを中心とする市民ランナーを対象としたトレーニングに関する疑問や質問を解決、共有するサービスです。
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>質問の投稿、回答の投稿</li>
                <li>質問、回答の編集、削除</li>
                <li>質問、回答の評価</li>
                <li>生成AIによる自動質問・回答</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/questions" className="block">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">質問を見る</h2>
                <p className="text-gray-700">
                  他のランナーからの質問を閲覧し、回答を投稿することができます。
                </p>
              </div>
            </Link>

            <Link href="/questions/new" className="block">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">質問を投稿</h2>
                <p className="text-gray-700">
                  トレーニングに関する疑問や質問を投稿し、他のランナーからの回答を得ることができます。
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
