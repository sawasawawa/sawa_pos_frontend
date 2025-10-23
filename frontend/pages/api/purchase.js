export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ detail: "商品が選択されていません" });
  }

  try {
    // SQLiteデータベースを使用（better-sqlite3）
    const Database = require('better-sqlite3');
    const path = require('path');

    const dbPath = path.join(process.cwd(), 'db_control', 'CRM.db');
    const db = new Database(dbPath);

    // トランザクション開始
    const insertPurchase = db.prepare(`
      INSERT INTO purchases (purchase_id, customer_id, purchase_date, total_amount)
      VALUES (?, ?, ?, ?)
    `);

    const insertPurchaseDetail = db.prepare(`
      INSERT INTO purchase_details (detail_id, purchase_id, item_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const updatePurchaseTotal = db.prepare(`
      UPDATE purchases SET total_amount = ? WHERE purchase_id = ?
    `);

    const transaction = db.transaction(() => {
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

        insertPurchaseDetail.run(
          detailId,
          purchaseId,
          item.item_id,
          item.quantity,
          item.price,
          subtotal
        );
      });

      // 購入レコードを作成
      insertPurchase.run(purchaseId, customerId, purchaseDate, totalAmount);

      return { purchaseId, totalAmount };
    });

    const result = transaction();
    db.close();

    res.status(200).json({
      message: "購入が完了しました",
      purchase_id: result.purchaseId,
      total_amount: result.totalAmount
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ detail: "購入処理でエラーが発生しました" });
  }
}
