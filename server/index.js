const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Serve built React frontend
app.use(express.static(path.join(__dirname, "../client/dist")));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/analyze", upload.fields([{ name: "person" }, { name: "clothing" }]), async (req, res) => {
  try {
    const personFile = req.files?.person?.[0];
    const clothingFile = req.files?.clothing?.[0];

    if (!personFile || !clothingFile) {
      return res.status(400).json({ error: "Both images are required." });
    }

    const toBase64 = (buf) => buf.toString("base64");
    const getMime = (file) => file.mimetype;

    const prompt = `You are an expert AI fashion stylist. You have been given two images:
1. A photo of a person
2. A photo of a clothing item

Please perform this structured analysis:

FIT ANALYSIS:
Based on the person's visible body build and the clothing's cut/style, provide a Fit Rating from 1-10. Explain if it will likely be too tight, too loose, or a perfect fit.

COLOR & DESIGN SUITABILITY:
Analyze whether the color complements the person's skin tone and if the design matches their style.

RECOMMENDATION:
Suggest specific ways to style this item - bottoms, shoes, accessories, and occasions. Be encouraging and specific.`;

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: getMime(personFile), data: toBase64(personFile.buffer) } },
          { type: "image", source: { type: "base64", media_type: getMime(clothingFile), data: toBase64(clothingFile.buffer) } },
          { type: "text", text: prompt }
        ]
      }]
    });

    const text = message.content.map(b => b.text || "").join("\n");
    res.json({ analysis: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Analysis failed." });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

// All other routes → React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
