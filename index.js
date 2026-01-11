const express = require("express");
const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, node: process.version, port: process.env.PORT });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log("listening", { port, node: process.version });
});

