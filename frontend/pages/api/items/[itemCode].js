// pages/api/items/[itemCode].js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { itemCode } = req.query;

  try {
    // Import database connection
    const { engine } = await import('../../db_control/connect_azure');
    const { Items } = await import('../../db_control/mymodels');
    const { sessionmaker } = await import('sqlalchemy.orm');

    const Session = sessionmaker(bind=engine);
    const session = Session();
    
    const item = await session.query(Items).filter(Items.item_id == itemCode).first();
    session.close();

    if (!item) {
      return res.status(404).json({ detail: "商品がマスタ未登録です" });
    }

    res.status(200).json({
      item_id: item.item_id,
      item_name: item.item_name,
      price: item.price
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ detail: "商品検索でエラーが発生しました" });
  }
}
