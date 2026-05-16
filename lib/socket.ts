import { io, Socket } from 'socket.io-client';

// Initialize the socket connection
// Using the same host the app is loaded from, so it works locally and on network
const socket: Socket = typeof window !== 'undefined' ? io() : null as any;

export default socket;
