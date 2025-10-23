export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { itemCode } = req.query;

  try {
    // SQLiteデータベースを使用（sql.js）
    const initSqlJs = require('sql.js');
    const fs = require('fs');
    const path = require('path');

    const dbPath = path.join(process.cwd(), 'db_control', 'CRM.db');
    const filebuffer = fs.readFileSync(dbPath);
    const SQL = await initSqlJs();
    const db = new SQL.Database(filebuffer);

    const stmt = db.prepare('SELECT item_id, item_name, price FROM items WHERE item_id = ?');
    const result = stmt.getAsObject({ $item_id: itemCode });

    stmt.free();
    db.close();

    if (!result.item_id) {
      return res.status(200).json({ product: null });
    }

    res.status(200).json({
      product: {
        code: result.item_id,
        name: result.item_name,
        unit_price: result.price
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ detail: "商品検索でエラーが発生しました" });
  }
}