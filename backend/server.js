require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

// Setup
const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI; // change if using cloud DB

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Mongoose model
const resultSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  vibe: String,
  meme: String,
  weekend: String,
}, { timestamps: true });

const Result = mongoose.model("Result", resultSchema);

// API: Save result
app.post("/api/results", async (req, res) => {
console.log('post, ', req.body);
  const { userId, vibe, meme, weekend } = req.body;

  try {
    const result = new Result({ userId, vibe, meme, weekend });
    await result.save();

    res.json({ success: true, userId })``;
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API: Get result by userId
app.get("/api/results/:id", async (req, res) => {
    console.log(req.params);
  try {
    const result = await Result.findOne({ userId: req.params.id });
    if (!result) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
