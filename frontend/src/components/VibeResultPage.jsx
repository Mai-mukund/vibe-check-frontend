import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const vibeMemes = {
  "Chill 😎": "😎",
  "Hyped 🚀": "🔥",
  "Moody 😶‍🌫️": "🌧️",
  "Focused 🧐": "🧐",
};

const VibeResultPage = () => {
  const { userId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5001/api/results/${userId}`)
      .then(({ data }) => {
        setResult(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!result) return <div>Result not found.</div>;

  const { vibe, meme, weekend } = result;

  return (
    <div style={{ padding: "2rem", fontFamily: "Poppins, sans-serif", textAlign: "center" }}>
      <h1>Your Vibe Check Result</h1>
      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{vibe} {vibeMemes[vibe]}</div>
      <p><strong>Meme Energy:</strong> {meme}</p>
      <p><strong>Weekend Style:</strong> {weekend}</p>
    </div>
  );
};

export default VibeResultPage;
