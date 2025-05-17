import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";
import { motion } from "framer-motion";

// Replace with your backend URL
const BACKEND_URL = "http://localhost:5001";
const socket = io(BACKEND_URL);

const QUESTIONS = [
  {
    question: "What's your current vibe?",
    options: ["Chill 😎", "Hyped 🚀", "Moody 😶‍🌫️", "Focused 🧐"],
  },
  {
    question: "Pick a meme energy:",
    options: ["Distracted Boyfriend", "Doge", "Woman Yelling at Cat", "This Is Fine"],
  },
  {
    question: "Best way to spend a weekend?",
    options: ["Netflix & Snacks", "Outdoor Adventure", "Gaming Marathon", "Art & Music"],
  },
];

const gradientBg = "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)";

// Map vibes to emojis/memes for playful result
const vibeMemes = {
  "Chill 😎": "😎",
  "Hyped 🚀": "🔥",
  "Moody 😶‍🌫️": "🌧️",
  "Focused 🧐": "🧐",
};

function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    socket.on("updateResults", (data) => {
      setResults(data);
    });
    socket.on("userCount", setUserCount);
    // Fetch initial results
    axios.get(`${BACKEND_URL}/results`).then((res) => setResults(res.data));
    // Fetch user count if available
    return () => {
      socket.off("updateResults");
      socket.off("userCount");
    };
  }, []);

  const handleOption = (option) => {
    setAnswers([...answers, option]);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      submitQuiz([...answers, option]);
    }
  };

  const submitQuiz = (finalAnswers) => {
    setLoading(true);
    setError(null);
    axios
      .post(`${BACKEND_URL}/submit`, { answers: finalAnswers })
      .then(() => {
        setSubmitted(true);
        setShareUrl(window.location.href);
        setLoading(false);
      })
      .catch(() => {
        setError("Submission failed! Please try again.");
        setLoading(false);
      });
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers([]);
    setSubmitted(false);
    setShareUrl("");
    setError(null);
  };

  // Helper for playful confetti effect
  const Confetti = () => (
    <div style={{
      pointerEvents: "none",
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      zIndex: 999, overflow: "hidden"
    }}>
      {[...Array(30)].map((_, i) => (
        <div key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 100}vh`,
            fontSize: `${Math.random() * 24 + 18}px`,
            opacity: 0.7,
            animation: `fall ${Math.random() * 2 + 2}s linear ${Math.random()}s infinite`,
            color: ["#ffb347", "#ff6961", "#77dd77", "#84b6f4", "#f49ac2"][i % 5]
          }}>
          {["🎉", "✨", "🎊", "💥", "🌟"][i % 5]}
        </div>
      ))}
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-10vh) rotate(0deg);}
            100% { transform: translateY(110vh) rotate(360deg);}
          }
        `}
      </style>
    </div>
  );

  // Helper for animated progress bar
  const ProgressBar = ({ value, max }) => (
    <div style={{ width: "100%", background: "#e0e0e0", borderRadius: 8, height: 10, margin: "18px 0" }}>
      <div
        style={{
          width: `${(value / max) * 100}%`,
          background: "linear-gradient(90deg, #f7971e 0%, #ffd200 100%)",
          height: "100%",
          borderRadius: 8,
          transition: "width 0.5s"
        }}
      />
    </div>
  );

  // Helper for playful badge
  const VibeBadge = ({ text }) => (
    <span style={{
      display: "inline-block",
      background: "linear-gradient(90deg,#f7971e,#ffd200,#f7971e)",
      color: "#fff",
      fontWeight: "bold",
      borderRadius: 24,
      padding: "8px 22px",
      fontSize: 18,
      margin: "0 0 12px 0",
      letterSpacing: 1.2,
      boxShadow: "0 2px 8px #ffd20044"
    }}>{text}</span>
  );

  // For accessibility: focus first button on step change
  useEffect(() => {
    if (!submitted) {
      const btn = document.querySelector("button[tabindex='0']");
      if (btn) btn.focus();
    }
  }, [step, submitted]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: gradientBg,
        padding: "0",
        margin: "0",
        fontFamily: "'Poppins', Arial, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: 500,
          margin: "48px auto",
          padding: "32px 28px 24px 28px",
          borderRadius: 24,
          background: "rgba(255,255,255,0.98)",
          boxShadow: "0 8px 32px #a18cd155",
          position: "relative"
        }}
      >
        <h1
          style={{
            textAlign: "center",
            background: "linear-gradient(90deg,#6c47ff,#f7971e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 900,
            fontSize: 34,
            marginBottom: 8,
            letterSpacing: 1.1
          }}
        >
          Vibe Check Quiz
        </h1>
        <div style={{ textAlign: "center", marginBottom: 24, color: "#6c47ff", fontWeight: 500 }}>
          <span style={{ fontSize: 22 }}>🚀</span> <span style={{ fontSize: 16 }}>Real-time, Playful, Shareable</span>
        </div>
        {/* Live user count */}
        <div style={{ fontWeight: "bold", margin: "12px 0", color: "#f7971e", textAlign: "center" }}>
          {userCount} users vibing right now!
        </div>
        {/* Error message */}
        {error && (
          <div style={{ color: "red", textAlign: "center", marginBottom: 10 }}>{error}</div>
        )}
        {/* Loading state */}
        {loading && (
          <div style={{ color: "#6c47ff", textAlign: "center", marginBottom: 10 }}>Loading your vibe...</div>
        )}
        {!submitted ? (
          <div>
            <div
              style={{
                marginBottom: 22,
                fontSize: 22,
                fontWeight: 600,
                color: "#6c47ff",
                textAlign: "center"
              }}
            >
              {QUESTIONS[step].question}
            </div>
            <div>
              {QUESTIONS[step].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOption(opt)}
                  tabIndex={0}
                  aria-label={`Select option: ${opt}`}
                  style={{
                    display: "block",
                    width: "100%",
                    margin: "18px 0",
                    padding: "18px",
                    fontSize: "1.18em",
                    borderRadius: "14px",
                    border: "none",
                    background: "linear-gradient(90deg,#f7971e,#ffd200)",
                    color: "#fff",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    boxShadow: "0 2px 12px #f7971e33",
                    cursor: "pointer",
                    transition: "transform 0.1s, box-shadow 0.1s",
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {opt}
                </button>
              ))}
            </div>
            <ProgressBar value={step + 1} max={QUESTIONS.length} />
            <div style={{ textAlign: "center", color: "#888", fontSize: 15 }}>
              Question {step + 1} of {QUESTIONS.length}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Confetti />
            <div style={{ textAlign: "center", margin: "0 0 12px 0" }}>
              <VibeBadge text={answers[0]} />
              <div style={{ fontSize: "2.2rem", marginTop: 6 }}>
                {vibeMemes[answers[0]] || "🎉"}
              </div>
            </div>
            <div style={{
              background: "#f8f9fa",
              borderRadius: 16,
              padding: "18px 14px",
              marginBottom: 18,
              boxShadow: "0 2px 12px #6c47ff11",
              fontSize: 18,
              color: "#333",
              textAlign: "center"
            }}>
              <div><span style={{ color: "#6c47ff", fontWeight: 600 }}>Meme Energy:</span> {answers[1]}</div>
              <div><span style={{ color: "#6c47ff", fontWeight: 600 }}>Weekend Plan:</span> {answers[2]}</div>
            </div>
            <h3 style={{
              marginTop: 32,
              marginBottom: 14,
              color: "#6c47ff",
              fontWeight: 700,
              fontSize: 22,
              textAlign: "center"
            }}>
              🌍 Live Vibe Results
            </h3>
            {results ? (
              <div>
                {QUESTIONS.map((q, idx) => (
                  <div key={idx} style={{ margin: "18px 0" }}>
                    <div style={{ fontWeight: "bold", color: "#f7971e", marginBottom: 4 }}>{q.question}</div>
                    {q.options.map((opt, jdx) => {
                      const count = results[idx]?.[opt] || 0;
                      const total = Object.values(results[idx] || {}).reduce((a, b) => a + b, 0) || 1;
                      const percent = Math.round((count / total) * 100);
                      return (
                        <div key={jdx} style={{ display: "flex", alignItems: "center", margin: "4px 0" }}>
                          <span style={{ width: 140 }}>{opt}</span>
                          <div style={{
                            background: "linear-gradient(90deg,#6c47ff,#f7971e)",
                            height: 12,
                            width: `${percent}%`,
                            borderRadius: 4,
                            marginRight: 8,
                            transition: "width 0.5s"
                          }}></div>
                          <span style={{ color: "#6c47ff", fontWeight: 600 }}>{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <p>Loading results...</p>
            )}
            {/* Social Share Buttons */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: 24, marginBottom: 18 }}>
              <FacebookShareButton url={shareUrl} quote={`I got "${answers[0]}" on the Vibe Check Quiz! Check your vibe:`}>
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton url={shareUrl} title={`I got "${answers[0]}" on the Vibe Check Quiz! Check your vibe:`}>
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <WhatsappShareButton url={shareUrl} title={`I got "${answers[0]}" on the Vibe Check Quiz! Check your vibe:`}>
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
            </div>
            {/* Copy Link & Restart */}
            <div style={{ margin: "32px 0 12px", textAlign: "center" }}>
              <button
                onClick={() => {
                  if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(shareUrl);
                    alert("Link copied! Share your vibe!");
                  } else {
                    // fallback for older browsers
                    const textArea = document.createElement("textarea");
                    textArea.value = shareUrl;
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                      document.execCommand('copy');
                      alert('Link copied! Share your vibe!');
                    } catch (err) {
                      alert('Copy failed. Please copy manually.');
                    }
                    document.body.removeChild(textArea);
                  }
                }}
                style={{
                  background: "linear-gradient(90deg,#6c47ff,#f7971e)",
                  color: "#fff",
                  padding: "14px 30px",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: "bold",
                  fontSize: 18,
                  cursor: "pointer",
                  marginRight: 12,
                  boxShadow: "0 2px 12px #6c47ff33",
                  letterSpacing: 1
                }}
              >
                📤 Copy Link
              </button>
              <button
                onClick={handleRestart}
                style={{
                  background: "#fff",
                  color: "#6c47ff",
                  padding: "14px 30px",
                  borderRadius: 10,
                  border: "2px solid #6c47ff",
                  fontWeight: "bold",
                  fontSize: 18,
                  cursor: "pointer",
                  letterSpacing: 1
                }}
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
        <div style={{ marginTop: 40, textAlign: "center", fontSize: 15, color: "#bbb" }}>
          <span>
            Built with <span style={{ color: "#f7971e" }}>💜</span> for the <strong>Vibe Builders Assignment</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
