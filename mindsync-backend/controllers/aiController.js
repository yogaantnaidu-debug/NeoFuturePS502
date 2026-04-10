const axios = require('axios');

exports.healthAI = async (req, res) => {
  try {
    console.log("API KEY:", process.env.OPENROUTER_API_KEY);
    const { message, history = [], profile } = req.body;

    // ✅ Validate input
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ✅ Check API key
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "API key missing in .env" });
    }

    const systemPrompt = `
You are a strict health assistant.

Rules:
- Only answer health-related queries
- Keep answers SHORT (max 4–5 lines)
- Do NOT use symbols like *, **, or markdown
- Use simple plain text
- Use numbered points like:
  1. ...
  2. ...
`;

    let messages = [
      { role: "system", content: systemPrompt }
    ];

    // ✅ Add user profile
    if (profile) {
      messages.push({
        role: "system",
        content: `User goal: ${profile.goal || ""}, lifestyle: ${profile.lifestyle || ""}`
      });
    }

    // ✅ Add chat history safely
    history.forEach(chat => {
      if (chat.message && chat.response) {
        messages.push({ role: "user", content: chat.message });
        messages.push({ role: "assistant", content: chat.response });
      }
    });

    // ✅ Current message
    messages.push({ role: "user", content: message });

    // ✅ API Call
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000 // ⏱️ prevents hanging
      }
    );

    // ✅ Safe response extraction
    const reply =
      response?.data?.choices?.[0]?.message?.content ||
      "No response from AI";

    res.json({ reply });

  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    const details = error.response?.data?.error?.message || error.message;

    res.json({ 
      reply: `I'm unable to answer right now because my AI service failed. Error: ${details}`,
      error: "AI request failed",
      details: error.response?.data || error.message
    });
  }
};

exports.getInsights = async (req, res) => {
  res.json({
    insights: [
      {
        icon: "💪",
        text: "You're someone who keeps showing up, even on hard days",
        meta: ""
      },
      {
        icon: "🌙",
        text: "You've been taking better care of your sleep lately",
        meta: ""
      },
      {
        icon: "✨",
        text: "You're building real consistency — 7 entries and counting",
        meta: ""
      }
    ]
  });
};