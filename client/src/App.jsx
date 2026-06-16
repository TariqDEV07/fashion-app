import { useState, useRef, useEffect } from "react";
import "./App.css";

function UploadBox({ label, hint, icon, image, onUpload, onRemove }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onUpload({ dataUrl: e.target.result, file });
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`upload-box ${drag ? "drag-over" : ""} ${image ? "has-image" : ""}`}
      onClick={() => !image && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])} />
      {image ? (
        <>
          <img src={image.dataUrl} alt="preview" className="preview-img" />
          <div className="preview-overlay">{label}</div>
          <button className="remove-btn" onClick={(e) => { e.stopPropagation(); onRemove(); }}>✕</button>
        </>
      ) : (
        <>
          <div className="upload-icon">{icon}</div>
          <div className="upload-label">{label}</div>
          <div className="upload-hint">{hint}</div>
          <div className="upload-cta">📷 Tap to upload</div>
        </>
      )}
    </div>
  );
}

function RatingBar({ rating }) {
  const label = rating >= 8 ? "🔥 Excellent" : rating >= 6 ? "✅ Good" : rating >= 4 ? "⚠️ Moderate" : "❌ Poor";
  return (
    <div className="rating-section">
      <div className="section-label">⭐ Fit Rating</div>
      <div className="rating-row">
        <span className="rating-num">{rating}</span>
        <span className="rating-denom">/10</span>
        <div className="rating-bar">
          <div className="rating-fill" style={{ width: `${rating * 10}%` }} />
        </div>
        <span className="rating-label">{label}</span>
      </div>
    </div>
  );
}

function parseAnalysis(text) {
  const ratingMatch = text.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
  const fitMatch = text.match(/FIT ANALYSIS[:\s]*([\s\S]*?)(?=COLOR|$)/i);
  const colorMatch = text.match(/COLOR[^:]*[:\s]*([\s\S]*?)(?=RECOMMENDATION|$)/i);
  const recMatch = text.match(/RECOMMENDATION[:\s]*([\s\S]*?)$/i);
  return {
    rating,
    fit: fitMatch?.[1]?.trim() || "",
    color: colorMatch?.[1]?.trim() || "",
    recommendation: recMatch?.[1]?.trim() || "",
    raw: text,
  };
}

export default function App() {
  const [person, setPerson] = useState(null);
  const [clothing, setClothing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  // Capture PWA install prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
    window.addEventListener('appinstalled', () => setInstalled(true));
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const canAnalyze = person && clothing && !loading;

  const analyze = async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("person", person.file);
      formData.append("clothing", clothing.file);
      const res = const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(parseAnalysis(data.analysis));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">👗</div>
        <div className="header-text">
          <div className="logo-text">StyleSense AI</div>
          <div className="logo-sub">Virtual Fashion Stylist</div>
        </div>
        {installPrompt && !installed && (
          <button className="install-btn" onClick={handleInstall}>
            📲 Install App
          </button>
        )}
      </header>

      <main className="main">
        <div className="hero">
          <h1 className="hero-title">Try Before You Wear</h1>
          <p className="hero-sub">Upload your photo + clothing item for instant AI style analysis</p>
        </div>

        <div className="upload-grid">
          <UploadBox label="Your Photo" hint="Clear front-facing photo" icon="🧍"
            image={person} onUpload={setPerson} onRemove={() => { setPerson(null); setResult(null); }} />
          <UploadBox label="Clothing Item" hint="Shirt, dress, jacket..." icon="👔"
            image={clothing} onUpload={setClothing} onRemove={() => { setClothing(null); setResult(null); }} />
        </div>

        <button className={`analyze-btn ${canAnalyze ? "active" : ""}`} onClick={analyze} disabled={!canAnalyze}>
          {loading ? <><span className="btn-spinner" /> Analyzing…</> : "✨ Analyze My Outfit"}
        </button>

        {error && <div className="error-box">⚠️ {error}</div>}

        {loading && (
          <div className="loading-card">
            <div className="loading-spinner" />
            <div className="loading-title">Analyzing your style…</div>
            <div className="loading-sub">Checking fit, color & styling potential</div>
          </div>
        )}

        {result && !loading && (
          <div className="result-card">
            <div className="result-header">
              <span className="result-title">Style Report</span>
              <span className="badge">AI Stylist</span>
            </div>

            {result.rating !== null && <RatingBar rating={result.rating} />}

            <div className="sections-grid">
              {result.fit && (
                <div className="section">
                  <div className="section-label">👔 Fit Analysis</div>
                  <div className="section-text">{result.fit}</div>
                </div>
              )}
              {result.color && (
                <div className="section">
                  <div className="section-label">🎨 Color & Design</div>
                  <div className="section-text">{result.color}</div>
                </div>
              )}
            </div>

            {result.recommendation && (
              <div className="section">
                <div className="section-label">✨ Styling Tips</div>
                <div className="section-text">{result.recommendation}</div>
              </div>
            )}

            {!result.fit && !result.color && (
              <div className="section">
                <div className="section-label">Analysis</div>
                <div className="section-text">{result.raw}</div>
              </div>
            )}

            <button className="reset-btn" onClick={() => { setPerson(null); setClothing(null); setResult(null); }}>
              Try Another Outfit →
            </button>
          </div>
        )}

        {/* Install banner for iOS (Safari doesn't support beforeinstallprompt) */}
        {!installed && !installPrompt && (
          <div className="ios-hint">
            📱 <strong>iPhone?</strong> Tap Share → "Add to Home Screen" to install
          </div>
        )}
      </main>
    </div>
  );
}
