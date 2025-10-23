// pages/api/items/[itemCode].js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { itemCode } = req.query;

          try {
            // SQLiteデータベースを使用（better-sqlite3）
            const Database = require('better-sqlite3');
            const path = require('path');

            const dbPath = path.join(process.cwd(), 'db_control', 'CRM.db');
            const db = new Database(dbPath);

            const stmt = db.prepare('SELECT item_id, item_name, price FROM items WHERE item_id = ?');
            const row = stmt.get(itemCode);

            db.close();

            if (!row) {
              return res.status(404).json({ detail: "商品がマスタ未登録です" });
            }

            res.status(200).json({
              item_id: row.item_id,
              item_name: row.item_name,
              price: row.price
            });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ detail: "商品検索でエラーが発生しました" });
  }
}
