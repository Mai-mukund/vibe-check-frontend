// Backend code for Vibe Check Quiz App

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
var admin = require("firebase-admin");
var serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vibe-check-quiz-ec2b8-default-rtdb.firebaseio.com"
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

// Store quiz results in Firebase Realtime Database under 'results'
// Structure: results/{questionIndex}/{option} = count

// Endpoint to submit quiz answers
app.post('/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }

    // Update counts in Firebase
    const updates = {};
    answers.forEach((answer, index) => {
      const path = `results/${index}/${answer}`;
      updates[path] = admin.database.ServerValue.increment(1);
    });

    await db.ref().update(updates);

    // Fetch updated results
    const snapshot = await db.ref('results').once('value');
    const results = snapshot.val() || {};

    // Emit updated results to all clients
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

