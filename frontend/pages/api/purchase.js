export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ detail: "商品が選択されていません" });
  }

  try {
    // SQLiteデータベースを使用（sql.js）
    const initSqlJs = require('sql.js');
    const fs = require('fs');
    const path = require('path');

    const dbPath = path.join(process.cwd(), 'db_control', 'CRM.db');
    const filebuffer = fs.readFileSync(dbPath);
    const SQL = await initSqlJs();
    const db = new SQL.Database(filebuffer);

    // 購入IDを生成
    const purchaseId = 'P' + Date.now().toString();
    const customerId = 'C001'; // デフォルト顧客
    const purchaseDate = new Date().toISOString().split('T')[0];

    let totalAmount = 0;

    // 購入詳細を処理
    items.forEach((item, index) => {
      const detailId = purchaseId + '_' + (index + 1).toString().padStart(2, '0');
      const subtotal = item.price * item.quantity;
      totalAmount += subtotal;

      // 購入詳細を挿入
      db.run(
        'INSERT INTO purchase_details (detail_id, purchase_id, item_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [detailId, purchaseId, item.item_id, item.quantity, item.price, subtotal]
      );
    });

    // 購入レコードを作成
    db.run(
      'INSERT INTO purchases (purchase_id, customer_id, purchase_date, total_amount) VALUES (?, ?, ?, ?)',
      [purchaseId, customerId, purchaseDate, totalAmount]
    );

    db.close();

    res.status(200).json({
      message: "購入が完了しました",
      purchase_id: purchaseId,
      total_amount: totalAmount
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ detail: "購入処理でエラーが発生しました" });
  }
}
