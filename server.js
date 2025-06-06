const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // ✅ Import socket.io

const app = express();
const server = http.createServer(app);
const io = new Server(server); // ✅ Initialize io

const activeUsers = new Set(); // ✅ Track usernames

// Serve static files
app.use(express.static(__dirname));

// ✅ Handle socket connections
io.on('connection', (socket) => {
  console.log('User connected');

  // Register new user
  socket.on('registerUser', ({ username }, callback) => {
    if (activeUsers.has(username)) {
      callback({ success: false, message: 'Username already taken' });
    } else {
      socket.username = username;
      activeUsers.add(username);
      callback({ success: true });
    }
  });

  // Join a room
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`${socket.username} joined room: ${room}`);
  });

  // Handle message
  socket.on('chatMessage', ({ room, username, message }) => {
    io.to(room).emit('chatMessage', { username, message });
  });

  // On disconnect
  socket.on('disconnect', () => {
    if (socket.username) {
      activeUsers.delete(socket.username);
      console.log(`User disconnected: ${socket.username}`);
    }
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

