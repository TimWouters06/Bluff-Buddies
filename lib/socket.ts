import { io, Socket } from 'socket.io-client';

// Initialize the socket connection
// Using NEXT_PUBLIC_SOCKET_URL for external hosting (Render) or same origin for local/combined hosting
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
const socket: Socket = typeof window !== 'undefined' ? io(socketUrl) : null as any;

export default socket;
