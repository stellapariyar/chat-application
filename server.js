const express = require('express');
const http = require('http');
const cors = require('cors'); // ✅ Import cors
const { Server } = require('socket.io');

const app = express(); // ✅ Create app first
app.use(cors());       // ✅ Then use CORS

const server = http.createServer(app);

// ✅ Allow CORS for socket.io (especially for Netlify frontend)
const io = new Server(server, {
  cors: {
    origin: "https://chat-app28.netlify.app", // ✅ Update to your Netlify frontend URL
    methods: ["GET", "POST"]
  }
});

const activeUsers = new Set();

// ✅ Serve static files if needed
app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('✅ User connected');

  socket.on('registerUser', ({ username }, callback) => {
    if (activeUsers.has(username)) {
      callback({ success: false, message: 'Username already taken' });
    } else {
      socket.username = username;
      activeUsers.add(username);
      callback({ success: true });
    }
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`✅ ${socket.username} joined room: ${room}`);
  });

  socket.on('chatMessage', ({ room, username, message }) => {
    io.to(room).emit('chatMessage', { username, message });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      activeUsers.delete(socket.username);
      console.log(`❌ User disconnected: ${socket.username}`);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
