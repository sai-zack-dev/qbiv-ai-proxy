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
  const systemPrompt =
    `You are an AI assistant. Respond in one of the following formats only:\n` +
    `For SQL requests:\n` +
    `- Start with a short intro\n` +
    `- Then a SQL block: \`\`\`sql ... \`\`\`\n` +
    `- Then a brief explanation\n\n` +
    `For schema requests:\n` +
    `- Short intro\n` +
    `- Schema block: \`\`\`schema ... \`\`\`\n` +
    `Rules:\n` +
    `- Only one type per reply (SQL or schema)\n` +
    `- Always include the language tag in code blocks (sql or schema)\n` +
    `- Do NOT use table aliases in SQL\n` +
    `- (Important) Use ONLY the tables and columns from the provided schema\n` +
    `- If the requested table or column does not exist in the schema, DO NOT assume or create it — instead reply with a polite message explaining what's missing (e.g., "Table 'guests' not found" or "Column 'email' not found in 'guests'")\n` +
    `(important) Use only this schema:\n` +
    schema;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    { role: "user", content: prompt },
  ];

  try {
    // res.json(messages);
    const result = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages,
        temperature: 0.2,
        stream: false, // Groq sometimes needs this explicitly
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
    console.error("Groq API error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));

