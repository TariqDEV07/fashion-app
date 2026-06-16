# 👗 StyleSense AI — Virtual Fashion Stylist

An AI-powered fashion analysis app. Upload a photo of yourself and a clothing item to get a detailed fit, color, and styling analysis powered by Claude.

---

## 🚀 Quick Start

### 1. Get your Anthropic API Key
Go to https://console.anthropic.com → API Keys → Create Key

### 2. Setup the Backend (Server)
```bash
cd server
npm install
cp .env.example .env
# Open .env and paste your API key:
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```
Server starts at **http://localhost:3001**

### 3. Setup the Frontend (Client)
Open a **new terminal**:
```bash
cd client
npm install
npm run dev
```
App opens at **http://localhost:3000** ✅

---

## 📁 Project Structure
```
fashion-app/
├── server/
│   ├── index.js          # Express server + Anthropic API proxy
│   ├── package.json
│   └── .env.example      # Copy to .env and add your API key
└── client/
    ├── src/
    │   ├── App.jsx        # Main React component
    │   ├── App.css        # Styles
    │   └── main.jsx       # Entry point
    ├── index.html
    ├── vite.config.js     # Proxy config → server
    └── package.json
```

---

## 🧠 How It Works
1. User uploads **person photo** + **clothing image** in the browser
2. React sends both as `multipart/form-data` to `/api/analyze`
3. Express server converts images to base64 and sends to Claude claude-opus-4-6
4. Claude analyzes fit, color, and style → returns text
5. Frontend parses and displays results with a rating bar

---

## ✨ Features
- 📸 Drag & drop or click to upload images
- 🔢 Fit Rating (1–10) with animated bar
- 👔 Fit Analysis — tight/loose/perfect
- 🎨 Color & Design Suitability
- ✨ Detailed Styling Recommendations
- 📱 Fully responsive (mobile-friendly)

---

## 🛠 Tech Stack
- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **AI:** Anthropic Claude claude-opus-4-6 (vision)
- **File Upload:** Multer
