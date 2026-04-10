const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../models/db'); // Synchronous / callback-based sqlite3 db

const JWT_SECRET = process.env.JWT_SECRET || 'mindsync_super_secret';

exports.signup = async (req, res) => {
  try {
    const { name, email, password, goal, aiPersonality } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, existing) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const hash = await bcrypt.hash(password, 10);
      const uuid = crypto.randomUUID();

      db.run(
        `INSERT INTO users (id, name, email, password, goal, aiPersonality) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuid, name, email, hash, goal, aiPersonality || 'Friendly Buddy'],
        function(err) {
          if (err) return res.status(500).json({ error: 'Signup failed' });
          
          const token = jwt.sign({ id: uuid, email }, JWT_SECRET, { expiresIn: '7d' });
          res.status(201).json({ 
            token, 
            user: { id: uuid, name, email, goal, aiPersonality: aiPersonality || 'Friendly Buddy' } 
          });
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, goal: user.goal, aiPersonality: user.aiPersonality }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getProfile = (req, res) => {
  db.get('SELECT id, name, email, goal, aiPersonality FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });
};

exports.updateProfile = (req, res) => {
  const { goal, aiPersonality } = req.body;
  db.run(
    'UPDATE users SET goal = COALESCE(?, goal), aiPersonality = COALESCE(?, aiPersonality) WHERE id = ?',
    [goal, aiPersonality, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ success: true });
    }
  );
};
