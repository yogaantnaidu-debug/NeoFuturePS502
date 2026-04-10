const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// The custom database file handles initialization automatically
const db = require('./models/db'); 

const moodRoutes = require('./routes/moodRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const screentimeRoutes = require('./routes/screentimeRoutes');

const app = express();

// ✅ Middleware FIRST
app.use(cors());
app.use(express.json());

// ✅ API Routes AFTER middleware
app.use('/api/ai', aiRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/users', userRoutes);
app.use('/api/screentime', screentimeRoutes);

// ✅ Serve static Frontend files
app.use(express.static(path.join(__dirname, '../mindsync-frontend/dist')));

// Test route (API health)
app.get('/api/health', (req, res) => {
  res.json({ message: 'MindSync API Running 🚀 with Custom SQLite Schema!' });
});

// ✅ Fallback to frontend index.html for React Router
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '../mindsync-frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`✅ Server running on port ${PORT}`);
});