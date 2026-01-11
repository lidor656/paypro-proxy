const express = require('express');
const app = express();

app.use(express.json());

// Health check for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy all /api/* requests to PayPro
app.post('/api/*', async (req, res) => {
  const path = req.path; // e.g., /api/Subscriptions/GetSubscriptionDetails
  const payproUrl = `https://store.payproglobal.com${path}`;
  
  console.log(`[PROXY] ${req.method} ${path} -> ${payproUrl}`);
  
  try {
    const response = await fetch(payproUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    console.log(`[PROXY] Response status: ${response.status}`);
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`[PROXY] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Keep legacy /paypro route for backward compatibility
app.post('/paypro', async (req, res) => {
  const payproUrl = 'https://store.payproglobal.com/api/Subscriptions/UpdateSubscription';
  
  try {
    const response = await fetch(payproUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`PayPro Proxy listening on 0.0.0.0:${port}`);
});

