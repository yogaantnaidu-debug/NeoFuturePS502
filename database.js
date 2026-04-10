const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

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
    });
  }
});

module.exports = db;
