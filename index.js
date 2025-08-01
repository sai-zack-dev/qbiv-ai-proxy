// index.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate-sql", async (req, res) => {
  const { prompt, schema } = req.body;

  const messages = [
    {
      role: "system",
      content: `You are a helpful AI that writes SQL queries based on schema. Respond with SQL only.\nSchema:\n${schema}`,
    },
    { role: "user", content: prompt },
  ];

  try {
    const result = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "mixtral-8x7b-32768",
        messages,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
