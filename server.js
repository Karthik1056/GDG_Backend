const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ⚠️ CRITICAL: Allow CORS so students can connect from their own files/CodePen
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Simple route to check if server is alive
app.get('/', (req, res) => {
    res.send('✅ Server is running! Copy this URL for your students.');
});

io.on('connection', (socket) => {
    console.log('New Artist Connected:', socket.id);

    // Listen for drawing data
    socket.on('submitDrawing', (data) => {
        // data = { name: "Alex", image: "base64..." }
        
        // Broadcast to everyone (Projector + other students)
        io.emit('newDrawing', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});