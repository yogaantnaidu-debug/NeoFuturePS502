const axios = require('axios');
const db = require('../models/db'); 
const crypto = require("crypto");

exports.healthAI = async (req, res) => {
  try {
    const { message, history = [], profile, aiPersonality, user_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "API key missing in .env" });
    }

    let systemPrompt = `You are a strict health assistant.\nRules:\n- Keep answers SHORT (max 4-5 lines)\n- Do NOT use markdown`;

    if (aiPersonality) {
      if (aiPersonality === 'Friendly Buddy') systemPrompt = "You are VitalAI, a warm, casual, supportive friend. Use emojis, speak casually. Short responses. No markdown.";
      if (aiPersonality === 'Strict Coach') systemPrompt = "You are VitalAI, a no-nonsense, disciplined coach. Tough-love responses. No markdown.";
      if (aiPersonality === 'Motivational Mentor') systemPrompt = "You are VitalAI, an inspiring mentor focused on growth and resilience. Uplifting advice. No markdown.";
      if (aiPersonality === 'Data Analyst') systemPrompt = "You are VitalAI, a logical, precise, data-driven assistant. Professional analytical tone. No markdown.";
    }

    let messages = [{ role: "system", content: systemPrompt }];
    let contextTracker = "";
    
    if (profile) contextTracker += `User goal: ${profile.goal || ""}. `;
    
    const fetchScreentime = () => new Promise((resolve) => {
      if (!user_id) return resolve(0);
      db.get('SELECT SUM(duration_minutes) as total FROM screentime WHERE user_id = ? AND created_at >= date("now", "localtime")', [user_id], (err, row) => {
        resolve((row && row.total) ? row.total : 0);
      });
    });

    const fetchSleep = () => new Promise((resolve) => {
      if (!user_id) return resolve(0);
      db.get('SELECT AVG(sleep) as avg_sleep FROM moods WHERE user_id = ? AND date >= date("now", "localtime")', [user_id], (err, row) => {
        resolve((row && row.avg_sleep) ? row.avg_sleep.toFixed(1) : 0);
      });
    });

    const stTotal = await fetchScreentime();
    const sleepTotal = await fetchSleep();
    
    if (stTotal > 0) contextTracker += `Today's screen time is ${stTotal} minutes. `;
    if (sleepTotal > 0) contextTracker += `The user had ${sleepTotal} hours of sleep recently. `;
    if (contextTracker.length > 0) messages.push({ role: "system", content: contextTracker });

    history.forEach(chat => {
      if (chat.role && chat.content) messages.push({ role: chat.role, content: chat.content });
    });
    messages.push({ role: "user", content: message });

    // OpenRouter API Call with Fallbacks for Rate Limits
    const freeModels = [
      "google/gemma-4-26b-a4b-it:free",
      "liquid/lfm-2.5-1.2b-instruct:free",
      "nvidia/nemotron-3-nano-30b-a3b:free",
      "qwen/qwen3-next-80b-a3b-instruct:free"
    ];

    let response = null;
    for (const mod of freeModels) {
      try {
        response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          { model: mod, messages },
          { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" }, timeout: 8000 }
        );
        if (response && response.data && response.data.choices) break; // Success
      } catch (err) {
        console.log(`[WARN] Model ${mod} failed with status:`, err.response?.status || err.message);
      }
    }

    const reply = response?.data?.choices?.[0]?.message?.content || "No response from AI";

    // Track in original 'chats' DB table seamlessly
    if (user_id) {
       db.run(`INSERT INTO chats (id, user_id, sender, text) VALUES (?, ?, ?, ?)`, [crypto.randomUUID(), user_id, 'user', message], () => {});
       db.run(`INSERT INTO chats (id, user_id, sender, text) VALUES (?, ?, ?, ?)`, [crypto.randomUUID(), user_id, 'ai', reply], () => {});
    }

    res.json({ reply });

  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "AI request failed" });
  }
};

exports.getInsights = (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.json({ insights: [] });

  db.all('SELECT * FROM moods WHERE user_id = ? ORDER BY date DESC LIMIT 5', [user_id], (err, records) => {
    if (err || records.length === 0) return res.json({ insights: [] });

    const insights = [];
    const avgStress = records.reduce((sum, r) => sum + r.stress, 0) / records.length;
    const avgSleep = records.reduce((sum, r) => sum + r.sleep, 0) / records.length;

    if (records.length >= 2) {
      if (avgStress >= 7) {
        insights.push({ icon: "◎", bg: "rgba(253,121,121,0.12)", color: "var(--coral)", text: "Your stress levels have been running high over the last few days.", meta: "Data Insight · Stress Analyzer" });
      } else if (avgStress <= 4) {
        insights.push({ icon: "◈", bg: "rgba(0,184,148,0.12)", color: "var(--teal)", text: "You've successfully managed stress well across recent entries!", meta: "Milestone achieved" });
      }

      if (avgSleep < 5) {
        insights.push({ icon: "✦", bg: "rgba(108,92,231,0.18)", color: "var(--purple-lt)", text: "Your sleep quality seems to be disrupted. Try scheduling a wind-down routine.", meta: "Pattern detected" });
      }
    }

    if (insights.length === 0) {
      insights.push({ icon: "✦", bg: "rgba(108,92,231,0.18)", color: "var(--purple-lt)", text: "Things look perfectly balanced right now. Keep logging to train the ML analysis!", meta: "Status Normal" });
    }

    res.json({ insights });
  });
};