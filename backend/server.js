import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ error: "Message required" });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${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`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: "You are MAAR AI, a helpful assistant." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    const reply = data.output_text || data.output?.[0]?.content?.[0]?.text || "No response";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`✅ MAAR AI backend running at http://localhost:${PORT}`));
