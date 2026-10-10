const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const roomRoutes = require('./routes/rooms');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS and Socket.io
// In production, prefer setting CLIENT_URLS to a comma-separated list of frontend URLs.
// The default includes common local dev ports plus your deployed Vercel URL.
const allowedOrigins = (process.env.CLIENT_URLS ||
  'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,https://collaborative-whiteboard-topaz.vercel.app'
).split(',');

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Socket handling
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
