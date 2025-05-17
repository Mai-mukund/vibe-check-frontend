// Backend code for Vibe Check Quiz App

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const admin = require('firebase-admin');

// Firebase config using environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.database();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Endpoint to submit quiz answers
app.post('/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }

    const updates = {};
    answers.forEach((answer, index) => {
      const path = `results/${index}/${answer}`;
      updates[path] = admin.database.ServerValue.increment(1);
    });

    await db.ref().update(updates);

    const snapshot = await db.ref('results').once('value');
    const results = snapshot.val() || {};

    io.emit('updateResults', results);

    res.json({ message: 'Answers submitted successfully' });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get aggregated results
app.get('/results', async (req, res) => {
  try {
    const snapshot = await db.ref('results').once('value');
    const results = snapshot.val() || {};
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
