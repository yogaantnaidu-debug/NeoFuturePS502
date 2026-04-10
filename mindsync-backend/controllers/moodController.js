const axios = require("axios");

let moods = [];

// POST (with ML)
exports.createMood = async (req, res) => {
  try {
    const { mood, score, note, tags, factors, timestamp } = req.body;
    
    // Set text to note, and age to a default value if missing
    const text = note || "";
    const age = 25;
    const stress = factors?.stress || 5;
    const sleepHours = factors?.sleep || 6;

    // Basic validation
    if (!mood) {
      return res.status(400).json({ message: "All fields required" });
    }

    let predictionData = null;

    // ✅ Call ML model ONLY if text is provided
    if (text) {
      try {
        const response = await axios.post("http://localhost:5001/predict", {
          text,
          age
        });

        predictionData = response.data;

      } catch (mlError) {
        console.log("ML not available:", mlError.message);
      }
    }

    const newMood = {
      id: Date.now(),
      mood,
      score,
      note,
      tags,
      factors,
      timestamp: timestamp || new Date().toISOString(),

      // ✅ ML output added
      mlPrediction: predictionData
    };

    moods.push(newMood);

    res.status(201).json(newMood);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// GET history
exports.getMoods = (req, res) => {
  res.json({ entries: moods });
};

// GET stats
exports.getMoodStats = (req, res) => {
  res.json({
    avgScore: 7.2,
    streak: Math.max(1, moods.length),
    bestStreak: 18,
    totalEntries: 94 + moods.length,
    since: "Jan 2025",
    weeklyScores: [5, 6, 4, 7, 8, 7, 7],
    todayMood: { label: "Neutral", emoji: "😐" },
    avgSleep: 6.7,
    avgStress: 5,
    sleep7Days: [7, 6.2, 7.5, 5.8, 6.5, 7.0, 6.7],
    stress7Days: [4, 6, 3, 7, 5, 4, 5]
  });
};