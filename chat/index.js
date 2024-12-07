// server.js
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });
const rooms = {};

server.on('connection', (socket) => {
    let roomCode = null;

    socket.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            // Handle room joining
            roomCode = data.code;
            if (!rooms[roomCode]) {
                rooms[roomCode] = [];
            }
            rooms[roomCode].push(socket);

            console.log(`User joined room: ${roomCode}`);
        } else if (data.type === 'message' && roomCode) {
            // Broadcast message to the room
            const room = rooms[roomCode];
            if (room) {
                room.forEach(client => {
                    if (client !== socket && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'message', text: data.text }));
                    }
                });
            }
        }
    });

    socket.on('close', () => {
        if (roomCode && rooms[roomCode]) {
            rooms[roomCode] = rooms[roomCode].filter(client => client !== socket);
        }
    });
});

console.log('WebSocket server running on ws://localhost:8080');
