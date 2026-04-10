const express = require('express');
const cors = require('cors');
require('dotenv').config();

const moodRoutes = require('./routes/moodRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ✅ Middleware FIRST
  app.use(cors()); // Allow all origins for local development
app.use(express.json());

// ✅ Routes AFTER middleware
app.use('/api/ai', aiRoutes);
app.use('/api/mood', moodRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'MindSync API Running 🚀' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});