const express = require("express");
const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, port: process.env.PORT, node: process.version });
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => console.log("listening", port));
