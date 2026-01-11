const express = require('express');
const app = express();
app.use(express.json());

app.post('/paypro', async (req, res) => {
  try {
    const response = await fetch('https://api.payproglobal.com/api/2.0/Subscriptions/UpdateSubscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000);
