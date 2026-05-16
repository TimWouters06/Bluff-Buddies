import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; 
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = new Map();
const roomTimeouts = new Map();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('create-room', ({ hostName, playerId }, callback) => {
            let code;
            do {
                code = Math.random().toString(36).substring(2, 6).toUpperCase();
            } while (rooms.has(code));
            
            socket.join(code);
            
            // Clear any existing timeouts for this room code (unlikely but safe)
            if (roomTimeouts.has(code)) {
                clearTimeout(roomTimeouts.get(code));
                roomTimeouts.delete(code);
            }

            const actualPlayerId = playerId || socket.id;
            
            const newRoom = {
                code,
                hostId: actualPlayerId,
                players: [{ id: actualPlayerId, socketId: socket.id, name: hostName || 'Host', isHost: true }]
            };
            
            rooms.set(code, newRoom);
            console.log(`Room created: ${code} by ${actualPlayerId}`);
            
            if (callback) callback({ success: true, roomCode: code, players: newRoom.players });
        });

        socket.on('join-room', ({ roomCode, playerName, playerId }, callback) => {
            const code = roomCode.toUpperCase();
            const roomData = rooms.get(code);
            
            if (roomData) {
                socket.join(code);
                
                const actualPlayerId = playerId || socket.id;
                
                // Check if player already in room (rejoin via join-room)
                const existingPlayer = roomData.players.find(p => p.id === actualPlayerId);
                if (existingPlayer) {
                    existingPlayer.socketId = socket.id;
                    existingPlayer.name = playerName; // Update name if changed
                } else {
                    const newPlayer = { 
                        id: actualPlayerId, 
                        socketId: socket.id,
                        name: playerName, 
                        isHost: false,
                        answer: null,
                        vote: null
                    };
                    roomData.players.push(newPlayer);
                }
                
                console.log(`${playerName} joined/rejoined room ${code}`);
                io.to(code).emit('players-updated', roomData.players);
                
                if (callback) callback({ success: true, roomCode: code, players: roomData.players, gameState: roomData.gameState });
            } else {
                if (callback) callback({ success: false, error: 'Room not found' });
            }
        });

        socket.on('sync-game-state', ({ roomCode, gameState }) => {
            const code = roomCode?.toUpperCase();
            const roomData = rooms.get(code);
            if (roomData) {
                roomData.gameState = gameState;
                if (gameState.players) {
                    // Update our internal socket IDs for the players from the synced state
                    // The gameState.players array has the correct order/roles
                    roomData.players = gameState.players.map(p => {
                        const existing = roomData.players.find(ep => ep.id === p.id);
                        return { ...p, socketId: existing?.socketId || p.socketId };
                    });
                }
                io.to(code).emit('game-state-synced', gameState);
            }
        });

        socket.on('submit-answer', ({ roomCode, targetPlayerId }) => {
            const code = roomCode?.toUpperCase();
            const roomData = rooms.get(code);
            if (roomData) {
                const player = roomData.players.find(p => p.socketId === socket.id);
                if (player) {
                    player.answer = targetPlayerId;
                    const allAnswered = roomData.players.every(p => p.answer !== null);
                    io.to(code).emit('players-updated', roomData.players);
                    if (allAnswered) {
                        io.to(code).emit('all-answers-submitted');
                    }
                }
            }
        });

        socket.on('submit-vote', ({ roomCode, suspectId }) => {
            const code = roomCode?.toUpperCase();
            const roomData = rooms.get(code);
            if (roomData) {
                const player = roomData.players.find(p => p.socketId === socket.id);
                if (player) {
                    player.vote = suspectId;
                    const allVoted = roomData.players.every(p => p.vote !== null);
                    io.to(code).emit('players-updated', roomData.players);
                    if (allVoted) {
                        io.to(code).emit('all-votes-submitted');
                    }
                }
            }
        });

        socket.on('leave-room', (roomCode) => {
            if (!roomCode) return;
            const code = roomCode.toUpperCase();
            socket.leave(code);
            
            const roomData = rooms.get(code);
            if (roomData) {
                const player = roomData.players.find(p => p.socketId === socket.id);
                if (player) {
                    if (player.id === roomData.hostId) {
                        io.to(code).emit('room-closed');
                        rooms.delete(code);
                    } else {
                        roomData.players = roomData.players.filter(p => p.socketId !== socket.id);
                        if (roomData.players.length === 0) {
                            rooms.delete(code);
                        } else {
                            io.to(code).emit('players-updated', roomData.players);
                        }
                    }
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            rooms.forEach((roomData, code) => {
                const player = roomData.players.find(p => p.socketId === socket.id);
                if (player) {
                    console.log(`Player ${player.id} (${player.name}) disconnected from room ${code}`);
                    
                    if (player.id === roomData.hostId) {
                        console.log(`Host disconnected from room ${code}. Closing room.`);
                        io.to(code).emit('room-closed');
                        rooms.delete(code);
                    } else {
                        // Non-host player left
                        roomData.players = roomData.players.filter(p => p.socketId !== socket.id);
                        io.to(code).emit('players-updated', roomData.players);
                    }
                }
            });
        });
    });

    server.once('error', (err) => {
        console.error(err);
        process.exit(1);
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
