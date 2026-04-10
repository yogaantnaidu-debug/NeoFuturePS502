fetch('http://localhost:5000/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'feeling anxious today what should i do?',
    history: [
      { role: "assistant", content: "Hi! I'm your MindSync AI companion. How are you feeling today?" }
    ]
  })
}).then(r => r.json()).then(console.log).catch(console.error);
