const express = require("express");
const app = express();

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, port: process.env.PORT, node: process.version });
});

// PayPro API Proxy
app.all("/api/*", async (req, res) => {
  const apiPath = req.params[0];
  const payproUrl = `https://api.payproglobal.com/api/2.3/${apiPath}`;
  
  console.log(`Proxying to: ${payproUrl}`);
  
  try {
    const response = await fetch(payproUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(
          `${process.env.PAYPRO_VENDOR_ID}:${process.env.PAYPRO_API_SECRET_KEY}`
        ).toString("base64")}`
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    console.log(`PayPro response status: ${response.status}`);
    res.status(response.status).json(data);
  } catch (error) {
    console.error("PayPro proxy error:", error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => console.log("Server listening on port", port));
