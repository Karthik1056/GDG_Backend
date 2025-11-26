// const express = require('express');
// const http = require('http');
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app);

// // ⚠️ CRITICAL: Allow CORS so students can connect from their own files/CodePen
// const io = new Server(server, {
//     cors: {
//         origin: "*", 
//         methods: ["GET", "POST"]
//     }
// });

// // Simple route to check if server is alive
// app.get('/', (req, res) => {
//     res.send('✅ Server is running! Copy this URL for your students.');
// });

// io.on('connection', (socket) => {
//     console.log('New Artist Connected:', socket.id);

//     // Listen for drawing data
//     socket.on('submitDrawing', (data) => {
//         // data = { name: "Alex", image: "base64..." }

//         // Broadcast to everyone (Projector + other students)
//         io.emit('newDrawing', data);
//     });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Allow connection from ANYWHERE (Students' phones, Your Laptop)
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- MEMORY OPTIMIZATION FOR 200 USERS ---
// Only store the last 50 images to prevent server crash
let drawingHistory = [];

app.get('/', (req, res) => {
    res.send(`✅ Server Running! Holding ${drawingHistory.length} drawings.`);
});

io.on('connection', (socket) => {
    // 1. New user joins? Send them the current gallery immediately
    socket.emit('loadHistory', drawingHistory);

    socket.on('submitDrawing', (data) => {
        // 2. Save to Memory
        drawingHistory.push(data);

        // 3. Prevent Memory Leak (Keep only last 50)
        if (drawingHistory.length > 50) {
            drawingHistory.shift();
        }

        // 4. Broadcast to Projector & other students
        io.emit('newDrawing', data);
    });
    socket.on('adminClear', () => {
        console.log("Admin cleared the board!");

        // A. Wipe the memory
        drawingHistory = [];

        // B. Tell everyone to wipe their screens
        io.emit('forceClear');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});