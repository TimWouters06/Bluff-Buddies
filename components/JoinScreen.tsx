import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import socket from '@/lib/socket';

export default function JoinScreen() {
    const { setGamePhase, setLobbyCode, setPlayers, localPlayerName } = useGameStore();
    const [code, setCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = () => {
        if (code.length !== 4) {
            setError('Code moet 4 letters zijn');
            return;
        }

        setError('');
        setIsJoining(true);

        try {
            let { localPlayerId, localPlayerName: storeName } = useGameStore.getState();
            
            // Ensure we have an ID
            if (!localPlayerId) {
                localPlayerId = Math.random().toString(36).substring(2, 11);
                useGameStore.setState({ localPlayerId });
            }

            console.log('Joining room with identity:', { localPlayerId, playerName: storeName });

            socket.emit('join-room', { 
                roomCode: code, 
                playerName: storeName.trim(),
                playerId: localPlayerId
            }, (response: any) => {
                setIsJoining(false);
                if (response && response.success) {
                    setLobbyCode(response.roomCode);
                    setPlayers(response.players || []);
                    useGameStore.setState({ connectionType: 'JOIN' });
                    setGamePhase('LOBBY');
                } else {
                    setError(response?.error || 'Kon niet joinen (ongeldige code)');
                }
            });
        } catch (err: any) {
            setIsJoining(false);
            setError(err.message || 'Er is een onverwachte fout opgetreden');
        }
    };

    return (
        <div className="h-full overflow-hidden bg-[#001D8B] relative flex flex-col">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(0,163,255,0.2)_0%,rgba(0,0,0,0)_70%)] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(0,102,255,0.2)_0%,rgba(0,0,0,0)_70%)] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstripe-dark.png')] opacity-10 mix-blend-overlay" />
            </div>

            {/* Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-6 pt-12 flex items-center justify-between relative z-10"
            >
                <div className="w-10 h-10" />
                <h1 className="text-xl font-black text-white uppercase tracking-[0.2em] flex-1 text-center pr-10">
                    Join Game
                </h1>
            </motion.div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm space-y-6"
                >
                    <div className="space-y-2 text-center mb-8">
                        <h2 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.3)]">
                            VUL CODE IN
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-white/60 text-xs font-bold uppercase tracking-widest pl-2">Room Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
                                placeholder="ABCD"
                                className="w-full bg-black/20 border-2 border-white/10 rounded-2xl p-4 text-center text-3xl font-black text-white placeholder:text-white/20 focus:outline-none focus:border-[#00A3FF] transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-center font-bold text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                        >
                            {error}
                        </motion.p>
                    )}

                    <Button
                        type="button"
                        onClick={handleJoin}
                        disabled={isJoining || code.length !== 4}
                        className="w-full bg-[#00A3FF] hover:bg-[#0082CC] text-white border-b-4 border-[#0066FF] text-xl font-black uppercase py-7 rounded-2xl shadow-xl active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        {isJoining ? <Loader2 className="animate-spin" size={24} /> : 'JOIN LOBBY'}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
