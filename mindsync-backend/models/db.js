const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    // Enable WAL mode and foreign keys for better performance and data integrity
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA foreign_keys = ON;');

    // Migrate Schema
    db.serialize(() => {
      // USERS TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Add columns safely (ignores error if they exist)
      db.run("ALTER TABLE users ADD COLUMN aiPersonality TEXT;", () => { });
      db.run("ALTER TABLE users ADD COLUMN goal TEXT;", () => { });

      // MOODS TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS moods (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          mood TEXT NOT NULL,
          sleep REAL NOT NULL,
          stress INTEGER NOT NULL,
          notes TEXT,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      db.run("ALTER TABLE moods ADD COLUMN mlPrediction TEXT;", () => { });
      db.run("ALTER TABLE moods ADD COLUMN source TEXT DEFAULT 'manual';", () => { });
      db.run("ALTER TABLE moods ADD COLUMN external_sync_id TEXT;", () => { });

      // CHATS TABLE
      db.run(`
        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          sender TEXT NOT NULL,
          text TEXT NOT NULL,
          emotion TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // SCREENTIME TABLE (For dashboard compatibility)
      db.run(`
        CREATE TABLE IF NOT EXISTS screentime (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          app_category TEXT,
          duration_minutes INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      db.run("ALTER TABLE screentime ADD COLUMN source TEXT DEFAULT 'manual';", () => { });
      db.run("ALTER TABLE screentime ADD COLUMN external_sync_id TEXT;", () => { });

      // USER INTEGRATIONS TABLE (For Google Fit)
      db.run(`
        CREATE TABLE IF NOT EXISTS user_integrations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          provider TEXT NOT NULL,
          access_token TEXT,
          refresh_token TEXT,
          last_sync DATETIME,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);
    });
  }
});

module.exports = db;
