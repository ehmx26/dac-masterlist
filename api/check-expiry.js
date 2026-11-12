export default function handler(req, res) {
  if (req.method === 'POST') {
    const { records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid records array provided' });
    }

    const today = new Date();
    const expiringSoon = records.filter(item => {
      if (!item.expiryDate) return false;
      const expDate = new Date(item.expiryDate);
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    });

    return res.status(200).json({
      success: true,
      totalChecked: records.length,
      expiringCount: expiringSoon.length,
      expiringSoon
    });
  }

  return res.status(200).json({
    status: 'API is running successfully',
    timestamp: new Date().toISOString()
  });
}
