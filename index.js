const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.post('/api/plan', async (req, res) => {
  const { city, hours } = req.body;
  const apiKey = req.headers['x-deepseek-api-key'] || process.env.DEEPSEEK_API_KEY;

  try {
    const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: `For a ${hours}h trip in ${city}, give a short adventure, 3 to-dos, 3 tips. JSON: {"adventure": "desc", "todo": ["1", "2", "3"], "tips": ["1", "2", "3"]}`
        }],
        max_tokens: 250
      })
    });
    const aiData = await aiRes.json();
    const rawContent = aiData.choices[0].message.content.replace(/```json\s*|\s*```/g, '').trim();
    const aiOutput = JSON.parse(rawContent);
    res.json(aiOutput);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      adventure: `Explore a cool spot in ${city} for ${hours}h!`,
      todo: ['Visit a landmark', 'Enjoy the view', 'Take a break'],
      tips: ['Pack light', 'Stay hydrated', 'Check local times']
    });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Running on', process.env.PORT || 3000));
