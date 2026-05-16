import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Users, User, Play, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import socket from '@/lib/socket';
import { useState } from 'react';
import GameSettingsModal from './GameSettingsModal';

export default function LobbyScreen() {
    const { 
        lobbyCode, 
        players, 
        setPlayers,
        connectionType, 
        startGame,
        setLocalPlayerId,
        resetGame
    } = useGameStore();

    const isHost = connectionType === 'HOST';
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        // Listen for updates to the player list
        const handlePlayersUpdated = (updatedPlayers: any[]) => {
            setPlayers(updatedPlayers);
        };

        socket.on('players-updated', handlePlayersUpdated);

        return () => {
            socket.off('players-updated', handlePlayersUpdated);
        };
    }, [setPlayers, setLocalPlayerId]);

    const handleLeaveLobby = () => {
        if (window.confirm("Weet je zeker dat je de lobby wilt verlaten?")) {
            resetGame();
        }
    };

    const handleStartGame = () => {
        if (players.length < 3) return;
        // Host locally generates state and emits it inside startGame()
        startGame();
    };

    return (
        <div className="h-full overflow-hidden bg-[#140001] relative flex flex-col">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-600/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/10 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-6 pt-12 flex items-center justify-between relative z-10"
            >
                <div className="w-10 h-10" />
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/5">
                        <Users size={16} className="text-white/60" />
                        <span className="text-white font-black">{players.length}</span>
                    </div>
                    {isHost && (
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 bg-white/10 rounded-full text-white/80 hover:bg-white/20 transition-colors border border-white/5"
                        >
                            <Settings size={20} />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-6 pt-2 relative z-10">
                {/* Room Code Display */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-white/50 text-xs font-black uppercase tracking-[0.3em] mb-2">Room Code</h2>
                    <div className="inline-block bg-black/40 border border-white/10 rounded-3xl px-12 py-4 backdrop-blur-md shadow-2xl">
                        <span className="text-6xl font-black tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            {lobbyCode}
                        </span>
                    </div>
                </motion.div>

                {/* Players List */}
                <div className="flex-1 overflow-y-auto mb-6 px-2 scrollbar-hide">
                    <div className="space-y-3">
                        <AnimatePresence>
                            {players.map((player, index) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-inner">
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-lg font-bold text-white">{player.name}</span>
                                    </div>
                                    {(player as any).isHost && (
                                        <span className="text-xs font-black uppercase tracking-wider text-orange-400 bg-orange-500/20 px-2 py-1 rounded-md">
                                            Host
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {/* Waiting animation */}
                        <motion.div
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="p-4 flex items-center justify-center gap-2 text-white/30"
                        >
                            <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </motion.div>
                    </div>
                </div>

                {/* Action Area */}
                <div className="mt-auto">
                    {isHost ? (
                        <Button
                            onClick={handleStartGame}
                            disabled={players.length < 3}
                            className={cn(
                                "w-full text-xl font-black uppercase py-8 rounded-[2rem] shadow-xl transition-all flex items-center justify-center gap-3",
                                players.length >= 3 
                                    ? "bg-white text-black hover:bg-gray-200 active:scale-95" 
                                    : "bg-white/10 text-white/30 cursor-not-allowed border-2 border-white/5"
                            )}
                        >
                            <Play fill="currentColor" size={24} />
                            {players.length < 3 ? `Nog ${3 - players.length} nodig` : 'START GAME'}
                        </Button>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center">
                            <p className="text-white/60 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={16} />
                                Wachten op host...
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <GameSettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </div>
    );
}
