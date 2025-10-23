'use client';
import { useState } from 'react';

export default function POSApp() {
  // POSアプリケーションの状態管理
  const [itemCode, setItemCode] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);



  // 商品検索関数
  const searchItem = async () => {
    if (!itemCode.trim()) {
      setError('商品コードを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentItem(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || '/api';
      console.log('API Base URL:', apiBaseUrl);
      const response = await fetch(`${apiBaseUrl}/items/${itemCode}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentItem(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '商品が見つかりません');
      }
    } catch (error) {
      setError('商品検索でエラーが発生しました');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 商品をカートに追加
  const addToCart = () => {
    if (!currentItem) return;

    const existingItem = cartItems.find(item => item.item_id === currentItem.item_id);
    
    if (existingItem) {
      // 既存の商品の数量を増やす
      setCartItems(cartItems.map(item => 
        item.item_id === currentItem.item_id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // 新しい商品を追加
      setCartItems([...cartItems, { ...currentItem, quantity: 1 }]);
    }

    // 入力フィールドをクリア
    setItemCode('');
    setCurrentItem(null);
    setError('');
  };

  // カートから商品を削除
  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.item_id !== itemId));
  };

  // 数量を変更
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.item_id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // 購入処理
  const processPurchase = async () => {
    if (cartItems.length === 0) {
      setError('購入する商品がありません');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || '/api';
      const response = await fetch(`${apiBaseUrl}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (response.ok) {
        const data = await response.json();
        setTotalAmount(data.total_amount);
        setPurchaseComplete(true);
        // カートをクリア
        setCartItems([]);
        setCurrentItem(null);
        setItemCode('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '購入処理でエラーが発生しました');
      }
    } catch (error) {
      setError('購入処理でエラーが発生しました');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 購入完了後の処理
  const handlePurchaseComplete = () => {
    setPurchaseComplete(false);
    setTotalAmount(0);
  };






  // 合計金額を計算
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // ユーザーインターフェースの構築
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">簡易POSシステム</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: 商品入力・表示エリア */}
          <div className="bg-white border border-gray-300 p-6">
            <h2 className="text-xl font-bold mb-4 text-black">商品入力</h2>
            
            {/* 商品コード入力 */}
            <div className="mb-4">
              <input
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="コード入力"
                className="w-full border border-gray-300 px-3 py-2 mb-2 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && searchItem()}
              />
              <button
                onClick={searchItem}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 font-medium"
              >
                {isLoading ? '検索中...' : '商品コード読み込み'}
              </button>
            </div>

            {/* 商品情報表示 */}
            <div className="mb-4">
              <input
                type="text"
                value={currentItem ? currentItem.item_name : ''}
                placeholder="名称"
                readOnly
                className="w-full border border-gray-300 px-3 py-2 mb-2 bg-gray-50"
              />
              <input
                type="text"
                value={currentItem ? `${currentItem.price}円` : ''}
                placeholder="単価"
                readOnly
                className="w-full border border-gray-300 px-3 py-2 mb-2 bg-gray-50"
              />
              <button
                onClick={addToCart}
                disabled={!currentItem}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 font-medium"
              >
                追加
              </button>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* 右側: 購入リストエリア */}
          <div className="bg-white border border-gray-300 p-6">
            <h2 className="text-xl font-bold mb-4 text-black">購入リスト</h2>
            
            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">購入する商品がありません</p>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between p-2 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.item_name}</div>
                      <div className="text-xs text-gray-600">
                        {item.item_id} x{item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 w-6 h-6 text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 w-6 h-6 text-sm"
                      >
                        +
                      </button>
                      <span className="text-sm font-medium ml-2">{item.price}円</span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">小計</span>
                    <span className="font-bold text-lg">{calculateTotal()}円</span>
                  </div>
                </div>
                
                <button
                  onClick={processPurchase}
                  disabled={isLoading || cartItems.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 font-medium text-lg mt-4"
                >
                  {isLoading ? '処理中...' : '購入'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 購入完了ポップアップ */}
        {purchaseComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border border-gray-300 p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-center mb-4 text-green-600">購入完了</h3>
              <p className="text-center text-lg mb-6">
                合計金額: <span className="font-bold text-xl">{totalAmount}円</span>
              </p>
              <button
                onClick={handlePurchaseComplete}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 font-medium"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




