const db = require('../models/db');

exports.logScreentime = (req, res) => {
  try {
    const { user_id, app_category, duration_minutes } = req.body;
    if (!user_id || !duration_minutes) return res.status(400).json({ error: 'Missing required fields' });

    db.run(
      'INSERT INTO screentime (user_id, app_category, duration_minutes) VALUES (?, ?, ?)',
      [user_id, app_category || 'General', duration_minutes],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database write error' });
        res.status(201).json({ success: true, message: 'Screentime logged successfully' });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getScreentime = (req, res) => {
  db.all(
    'SELECT * FROM screentime WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.params.userId],
    (err, records) => {
      if (err) return res.status(500).json({ error: 'Database read error' });
      res.json(records || []);
    }
  );
};
