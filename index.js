const express = require("express");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, port: process.env.PORT, node: process.version });
});

app.all("/api/*", async (req, res) => {
  const apiPath = req.params[0];
  // הURL הנכון של PayPro!
  const payproUrl = `https://store.payproglobal.com/api/${apiPath}`;
  
  console.log(`📡 Proxying ${req.method} to: ${payproUrl}`);
  
  try {
    const response = await fetch(payproUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json"
      },
      // PayPro מקבל את המפתחות בתוך ה-body, לא ב-headers
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    console.log(`✅ PayPro responded: ${response.status}`);
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`❌ Proxy error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => console.log("listening", port));

