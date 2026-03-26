
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

const rooms = {};

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function broadcastUpdate(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    const message = JSON.stringify({
        action: 'PARTICIPANTS_UPDATED',
        participants: room.participants
    });

    room.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', ws => {
    let currentRoom = null;
    let currentUserAddress = null;

    ws.on('message', message => {
        try {
            const data = JSON.parse(message);

            switch (data.action) {
                case 'CREATE_ROOM': {
                    const roomCode = generateRoomCode();
                    rooms[roomCode] = {
                        clients: [ws],
                        participants: [data.creatorAddress]
                    };
                    currentRoom = roomCode;
                    currentUserAddress = data.creatorAddress;

                    ws.send(JSON.stringify({
                        action: 'ROOM_CREATED',
                        roomCode: roomCode,
                        participants: rooms[roomCode].participants
                    }));
                    break;
                }

                case 'JOIN_ROOM': {
                    const room = rooms[data.roomCode];
                    if (room) {
                        room.clients.push(ws);
                        room.participants.push(data.participantAddress);
                        currentRoom = data.roomCode;
                        currentUserAddress = data.participantAddress;
                        broadcastUpdate(data.roomCode);
                    } else {
                        ws.send(JSON.stringify({ action: 'ERROR', message: 'Room not found' }));
                    }
                    break;
                }
            }
        } catch (error) {
            console.error("Failed to process message:", message, error);
        }
    });

    ws.on('close', () => {
        if (currentRoom && rooms[currentRoom]) {
            const room = rooms[currentRoom];
            
            // Remove the client
            const clientIndex = room.clients.indexOf(ws);
            if (clientIndex > -1) {
                room.clients.splice(clientIndex, 1);
            }

            // Remove the participant address
            const participantIndex = room.participants.indexOf(currentUserAddress);
            if (participantIndex > -1) {
                room.participants.splice(participantIndex, 1);
            }

            if (room.clients.length === 0) {
                // If the room is empty, delete it
                delete rooms[currentRoom];
            } else {
                // Otherwise, notify remaining participants
                broadcastUpdate(currentRoom);
            }
        }
    });

    console.log('Client connected');
});

console.log('WebSocket server started on port 8080');
