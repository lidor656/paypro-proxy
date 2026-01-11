const express = require("express");

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, port: process.env.PORT, node: process.version });
});

// PayPro API proxy - forwards all /api/* requests to PayPro
app.all("/api/*", async (req, res) => {
  const apiPath = req.params[0];
  const payproUrl = `https://store.payproglobal.com/api/2.3/${apiPath}`;
  
  console.log(`[PROXY] ${req.method} -> ${payproUrl}`);
  console.log(`[PROXY] Request body:`, JSON.stringify(req.body));
  
  try {
    const fetchOptions = {
      method: req.method,
      headers: { "Content-Type": "application/json" }
    };
    
    // Only add body for non-GET requests
    if (req.method !== "GET" && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(payproUrl, fetchOptions);
    const responseText = await response.text();
    
    console.log(`[PROXY] PayPro status: ${response.status}`);
    console.log(`[PROXY] PayPro response: ${responseText.substring(0, 500)}`);
    
    // Try to parse as JSON, otherwise return as text
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`[PROXY] Error:`, error.message);
    res.status(500).json({ 
      error: error.message,
      url: payproUrl,
      method: req.method
    });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`[PROXY] PayPro proxy running on port ${port}`);
});

