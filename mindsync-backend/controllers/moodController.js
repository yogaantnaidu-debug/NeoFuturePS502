const axios = require("axios");
const crypto = require("crypto");
const db = require('../models/db');

exports.createMood = async (req, res) => {
  try {
    const { user_id, mood, stress, sleepHours, text, age } = req.body;

    // Basic validation
    if (mood === undefined || stress === undefined || sleepHours === undefined) {
      return res.status(400).json({ message: "Mood, stress, and sleep fields required" });
    }

    let predictionData = null;

    // Call ML model optionally
    if (text && age) {
      try {
        const response = await axios.post("http://localhost:5001/predict", { text, age });
        predictionData = JSON.stringify(response.data);
      } catch (mlError) {
        console.log("ML not available:", mlError.message);
      }
    }

    const uuid = crypto.randomUUID();

    db.run(
      `INSERT INTO moods (id, user_id, mood, sleep, stress, notes, mlPrediction) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuid, user_id || 'anonymous', mood, sleepHours, stress, text || null, predictionData],
      function (err) {
        if (err) {
           console.error(err);
           return res.status(500).json({ error: "Something went wrong saving mood log" });
        }
        res.status(201).json({
          id: uuid,
          user_id,
          mood,
          stress,
          sleepHours,
          mlPrediction: predictionData ? JSON.parse(predictionData) : null
        });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getMoods = (req, res) => {
  let query = 'SELECT * FROM moods';
  let params = [];

  if (req.query.user_id) {
    query += ' WHERE user_id = ?';
    params.push(req.query.user_id);
  }
  
  query += ' ORDER BY date DESC LIMIT 50';

  db.all(query, params, (err, records) => {
    if (err) return res.status(500).json({ error: "Server error" });
    
    const formatted = records.map(r => ({
      ...r,
      mlPrediction: r.mlPrediction ? JSON.parse(r.mlPrediction) : null
    }));

    res.json(formatted);
  });
};

exports.getMoodStats = (req, res) => {
  const user_id = req.query.user_id;

  // Pre-compute the past 7 days based physically on the India Standard Timezone
  const today = new Date();
  const optionsDay = { timeZone: 'Asia/Kolkata', weekday: 'short' };
  const optionsFull = { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' };
  
  const weeklyDays = [];
  const weeklyScores = [0, 0, 0, 0, 0, 0, 0];
  const dateMap = {};
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = new Intl.DateTimeFormat('en-IN', optionsDay).format(d);
    const fullStr = new Intl.DateTimeFormat('en-IN', optionsFull).format(d);
    weeklyDays.push(dayStr);
    dateMap[fullStr] = 6 - i; // mapped to index [0-6]
  }

  const empty = { avgScore: "0.0", streak: 0, bestStreak: 0, totalEntries: 0, since: "Today", modelConfidence: 0, weeklyScores, weeklyDays, moodDrivers: [] };
  
  if (!user_id) return res.json(empty);

  db.all('SELECT * FROM moods WHERE user_id = ? ORDER BY date ASC', [user_id], (err, records) => {
    if (err || records.length === 0) return res.json(empty);

    const moodMap = { "Low": 2, "Meh": 4, "Okay": 6, "Good": 8, "Great": 10 };
    let totalScore = 0;
    
    records.forEach(r => { 
       const score = moodMap[r.mood] || 5;
       totalScore += score; 
       
       // Map to IST safely formatting UTC out of SQLite
       const isoDate = r.date.replace(' ', 'T');
       const rDateStrRaw = isoDate.includes('Z') ? isoDate : isoDate + 'Z';
       const rDate = new Date(rDateStrRaw);
       if (!isNaN(rDate.getTime())) {
          const rDateStr = new Intl.DateTimeFormat('en-IN', optionsFull).format(rDate);
          if (dateMap[rDateStr] !== undefined) {
             weeklyScores[dateMap[rDateStr]] = score; // latest score overrides earlier logs on same day
          }
       }
    });

    const avgScore = (totalScore / records.length).toFixed(1);
    
    // Start date in IST
    const isoSince = records[0].date.replace(' ', 'T');
    const rawSince = isoSince.includes('Z') ? isoSince : isoSince + 'Z';
    const sinceDateObj = new Date(rawSince);
    const sinceDate = !isNaN(sinceDateObj.getTime()) ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', year: 'numeric' }).format(sinceDateObj) : 'Today';

    let sleepHigh = 0; let stressHigh = 0;
    const uniqueDays = new Set();

    records.forEach(r => {
        if (r.sleep >= 7) sleepHigh++;
        if (r.stress <= 4) stressHigh++;
        const isoDStr = r.date.replace(' ', 'T');
        const dStr = isoDStr.includes('Z') ? isoDStr : isoDStr + 'Z';
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) uniqueDays.add(new Intl.DateTimeFormat('en-IN', optionsFull).format(d));
    });

    const streakCount = uniqueDays.size; 
    const mlConf = records[records.length-1].mlPrediction ? 85 : 0;

    res.json({
      avgScore,
      streak: streakCount,
      bestStreak: streakCount,
      totalEntries: records.length,
      since: sinceDate,
      modelConfidence: mlConf,
      weeklyScores,
      weeklyDays, // Inject dynamics days back into the UI
      moodDrivers: [
        { label: "Good Sleep", pct: Math.round((sleepHigh / records.length)*100) || 0, color: "var(--purple)" },
        { label: "Low Stress", pct: Math.round((stressHigh / records.length)*100) || 0, color: "var(--teal)" },
      ]
    });
  });
};