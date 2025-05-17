import { useState, useEffect } from "react";
import axios from "axios"; // <-- import axios here
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

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

const vibeMemes = {
  "Chill 😎": "😎",
  "Hyped 🚀": "🔥",
  "Moody 😶‍🌫️": "🌧️",
  "Focused 🧐": "🧐",
};

const gradientBg = "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)";

const VibeCheckApp = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [shareUrl, setShareUrl] = useState(window.location.href);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      axios.get(`http://localhost:5001/api/results/${id}`)
        .then(({ data }) => {
          if (data.data?.answers?.length === 3) {
            setAnswers(data.data.answers);
            setSubmitted(true);
            setUserId(id);
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleOption = async (option) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const id = uuidv4();
      setUserId(id);
      setSubmitted(true);

      try {
        console.log(userId);
        await axios.post("http://localhost:5001/api/results", {
          userId: id,
          answers: newAnswers,
        });

        console.log('request sent');

        const newUrl = `${window.location.origin}${window.location.pathname}?id=${id}`;
        window.history.replaceState(null, "", newUrl);
        setShareUrl(newUrl);
      } catch (err) {
        console.error("Failed to save answers", err);
      }
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers([]);
    setSubmitted(false);
    setUserId(null);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const Confetti = () => (
    <div
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999,
        overflow: "hidden",
      }}
    >
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 100}vh`,
            fontSize: `${Math.random() * 24 + 18}px`,
            opacity: 0.7,
            animation: `fall ${Math.random() * 2 + 2}s linear ${
              Math.random() * 1
            }s infinite`,
            color: ["#ffb347", "#ff6961", "#77dd77", "#84b6f4", "#f49ac2"][i % 5],
          }}
        >
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: gradientBg,
        fontFamily: "'Poppins', Arial, sans-serif",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          margin: "auto",
          background: "#fff",
          padding: "2rem",
          borderRadius: 24,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            background: "linear-gradient(90deg,#6c47ff,#f7971e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: 34,
            fontWeight: 900,
            marginBottom: 10,
          }}
        >
          Vibe Check Quiz
        </h1>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 22 }}>🚀</span>{" "}
          <span style={{ fontSize: 16 }}>Playful & Shareable</span>
        </div>

        {!submitted ? (
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {QUESTIONS[step].question}
            </div>
            {QUESTIONS[step].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOption(opt)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "16px",
                  marginBottom: "12px",
                  background: "linear-gradient(90deg,#f7971e,#ffd200)",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "bold",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {opt}
              </button>
            ))}
            <div
              style={{ textAlign: "center", color: "#999", marginTop: 12 }}
            >
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
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  background: "linear-gradient(90deg,#f7971e,#ffd200)",
                  color: "#fff",
                  display: "inline-block",
                  padding: "10px 20px",
                  borderRadius: 24,
                  fontSize: 20,
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px #ffd20055",
                }}
              >
                {answers[0]}
              </div>
              <div style={{ fontSize: "2rem", marginTop: 10 }}>
                {vibeMemes[answers[0]] || "🎉"}
              </div>
            </div>

            <div
              style={{
                background: "#f9f9f9",
                borderRadius: 16,
                padding: "18px",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <strong>Meme Energy:</strong> {answers[1]}
              </div>
              <div>
                <strong>Weekend Plan:</strong> {answers[2]}
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <FacebookShareButton
                url={shareUrl}
                quote={`I got "${answers[0]}" on the Vibe Check Quiz!`}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton
                url={shareUrl}
                title={`I got "${answers[0]}" on the Vibe Check Quiz!`}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <WhatsappShareButton
                url={shareUrl}
                title={`I got "${answers[0]}" on the Vibe Check Quiz!`}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert("Link copied to clipboard!");
                }}
                style={{
                  background: "linear-gradient(90deg,#6c47ff,#f7971e)",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginRight: 10,
                  cursor: "pointer",
                }}
              >
                📤 Copy Link
              </button>

              <button
                onClick={handleRestart}
                style={{
                  background: "#fff",
                  color: "#6c47ff",
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: "2px solid #6c47ff",
                  fontWeight: "bold",
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VibeCheckApp;
