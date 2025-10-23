// pages/api/items/[itemCode].js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { itemCode } = req.query;

  try {
    // SQLiteデータベースを使用（シンプルな実装）
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    
    const dbPath = path.join(process.cwd(), 'db_control', 'CRM.db');
    const db = new sqlite3.Database(dbPath);

    db.get(
      'SELECT item_id, item_name, price FROM items WHERE item_id = ?',
      [itemCode],
      (err, row) => {
        db.close();
        
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ detail: "データベースエラーが発生しました" });
        }
        
        if (!row) {
          return res.status(404).json({ detail: "商品がマスタ未登録です" });
        }

        res.status(200).json({
          item_id: row.item_id,
          item_name: row.item_name,
          price: row.price
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ detail: "商品検索でエラーが発生しました" });
  }
}
