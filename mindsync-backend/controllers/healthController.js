const crypto = require('crypto');
const db = require('../models/db');

// Stub for Google Fit OAuth
exports.connectGoogleFit = (req, res) => {
  // In a real application, this would redirect to Google's OAuth consent screen
  // For now, we mock the successful connection
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: "User ID required" });

  const integrationId = crypto.randomUUID();
  const mockAccessToken = "mock_access_token_fit_" + crypto.randomBytes(8).toString('hex');
  const mockRefreshToken = "mock_refresh_token_fit_" + crypto.randomBytes(8).toString('hex');

  // Upsert user integration
  db.run(
    `INSERT INTO user_integrations (id, user_id, provider, access_token, refresh_token, last_sync)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET access_token=excluded.access_token, refresh_token=excluded.refresh_token`,
    [integrationId, user_id, 'google_fit', mockAccessToken, mockRefreshToken],
    (err) => {
      if (err) return res.status(500).json({ error: "Could not save integration" });
      res.json({ success: true, message: "Google Fit connected successfully" });
    }
  );
};

// Sync Data from Google Fit
exports.syncHealthData = (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: "User ID required" });

  // Verify integration exists
  db.get("SELECT * FROM user_integrations WHERE user_id = ? AND provider = 'google_fit'", [user_id], (err, row) => {
    if (err || !row) return res.status(400).json({ error: "Google Fit not connected" });

    // Mock API response from Google Fit (sleep in hours, screentime in minutes)
    const mockSleepDuration = parseFloat((5 + Math.random() * 4).toFixed(1)); // 5 to 9 hours
    const mockScreentime = Math.floor(Math.random() * 180) + 60; // 60 to 240 mins

    const syncId = crypto.randomUUID();

    // 1. Sync Screentime
    db.run(
      `INSERT INTO screentime (user_id, app_category, duration_minutes, source, external_sync_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, 'Google Fit Sync', mockScreentime, 'google_fit', syncId]
    );

    // 2. We don't necessarily log a mood, but we might want to store the sleep independently.
    // However, since mood and sleep are tightly coupled in the basic schema, we could just return the sleep 
    // to the frontend to populate the UI automatically, or create a 'sleep_only' blank mood entry.
    // For now, we will update the integration sync time.
    db.run("UPDATE user_integrations SET last_sync = datetime('now') WHERE id = ?", [row.id]);

    res.json({
      success: true,
      data: {
        synced_sleep_hours: mockSleepDuration,
        synced_screentime_minutes: mockScreentime,
        sync_timestamp: new Date().toISOString()
      }
    });
  });
};

exports.getConnectionStatus = (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "User ID required" });

  db.get("SELECT provider, last_sync FROM user_integrations WHERE user_id = ? AND provider = 'google_fit'", [user_id], (err, row) => {
    if (err || !row) return res.json({ connected: false });
    res.json({ connected: true, last_sync: row.last_sync });
  });
};
