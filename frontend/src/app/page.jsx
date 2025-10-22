'use client';
import { useState } from 'react';

const fetchAddress = async (postalCode) => {
    try {
        const response = await fetch(`http://localhost:8000/zipcode/${postalCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
        return { error: "住所情報を取得できませんでした" };
    }
};


export default function Home() {
  // useStateを使った値（状態）管理
  const [getMessage, setGetMessage] = useState('');
  const [multiplyNumber, setMultiplyNumber] = useState('');
  const [multiplyResult, setMultiplyResult] = useState('');
  const [divideNumber, setDivideNumber] = useState('');
  const [divideResult, setDivideResult] = useState('');
  const [charactersCount, setCharactersCount] = useState('');
  const [charactersResult, setCharactersResult] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [postResult, setPostResult] = useState('');
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState(null);
  const [error, setError] = useState("");



  // FastAPIのエンドポイント設定
  const handleGetRequest = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/hello');
      const data = await response.json();
      setGetMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMultiplyRequest = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/multiply/${multiplyNumber}`);
      const data = await response.json();
      setMultiplyResult(data.doubled_value.toString());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDivideRequest = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/divide/${divideNumber}`);
      const data = await response.json();
      setDivideResult(data.divided_value.toString());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCountCharactersRequest = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/characters_count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({text: charactersCount}),
      });
      const data = await response.json();
      setCharactersResult(data.characters_count.toString());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePostRequest = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/echo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: postMessage }),
      });
      const data = await response.json();
      setPostResult(data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleSearch = async () => {
    setError("");
    const data = await fetchAddress(postalCode);
    if (!data || data.error || !data.results) {
        setError(data.error || "住所情報が見つかりません");
        setAddress(null);
    } else {
        setAddress(data.results[0]); // 最初の結果のみ表示
    }
};






  // ユーザーインターフェースの構築
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Next.jsとFastAPIの連携アプリ</h1>
      <div className="space-y-8">
        {/* GETリクエスト */}
        <section>
          <h2 className="text-xl font-bold mb-4">GETリクエストを送信</h2>
          <button
            onClick={handleGetRequest}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            GETリクエストを送信
          </button>
          {getMessage && (
            <p className="mt-2">サーバーからのGET応答: {getMessage}</p>
          )}
        </section>

        {/* ID指定のGET */}
        <section>
          <h2 className="text-xl font-bold mb-4">数値を2倍するリクエストを送信</h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={multiplyNumber}
              onChange={(e) => setMultiplyNumber(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={handleMultiplyRequest}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              送信
            </button>
          </div>
          {multiplyResult && (
            <p className="mt-2">FastAPIからの応答: {multiplyResult}</p>
          )}
        </section>

        {/* ID指定のGET2 */}
        <section>
          <h2 className="text-xl font-bold mb-4">数値を2で割るリクエストを送信</h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={divideNumber}
              onChange={(e) => setDivideNumber(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={handleDivideRequest}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              送信
            </button>
          </div>
          {divideResult && (
            <p className="mt-2">FastAPIからの応答: {divideResult}</p>
          )}
        </section>

        {/* POSTリクエスト 文字数をカウント*/}
        <section>
          <h2 className="text-xl font-bold mb-4">文字数をカウント</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={charactersCount}
              onChange={(e) => setCharactersCount(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={handleCountCharactersRequest}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              送信
            </button>
          </div>
          {charactersResult && (
            <p className="mt-2">FastAPIからのPOST応答: {charactersResult}</p>
          )}
        </section>

        {/* POSTリクエスト */}
        <section>
          <h2 className="text-xl font-bold mb-4">POSTリクエストを送信</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={postMessage}
              onChange={(e) => setPostMessage(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={handlePostRequest}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              送信
            </button>
          </div>
          {postResult && (
            <p className="mt-2">FastAPIからのPOST応答: {postResult}</p>
          )}
        </section>

        {/* 郵便番号API */}
        <section>
          <h2 className="text-xl font-bold mb-4">郵便番号を送信</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              送信
            </button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {address && (
            <p className="mt-2">FastAPIからのPOST応答: {address?.address1 || "不明"} {address?.address2 || ""} {address.address3|| ""}</p>
          )}
        </section>
      </div>
    </div>
  );
}




