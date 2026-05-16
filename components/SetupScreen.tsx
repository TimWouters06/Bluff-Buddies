'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Play, X, ArrowLeft, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import GameSettingsModal from './GameSettingsModal';

export default function SetupScreen() {
    const { players, addPlayer, removePlayer, startGame, resetGame } = useGameStore();
    const [name, setName] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            addPlayer(name.trim());
            setName('');
        }
    };

    return (
        <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide relative">
            <div className="min-h-full flex flex-col max-w-md mx-auto p-6 space-y-6 w-full">
                {/* Header Area */}
                <div className="flex items-center justify-between pt-6">
                    <div className="w-10 h-10" />
                    <div className="flex-1 text-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Setup</h2>
                    </div>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 bg-white/5 rounded-2xl text-white/60 hover:text-white transition-colors"
                    >
                        <Settings size={20} />
                    </button>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">Wie speelt?</h2>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">Voeg spelers toe</p>
                </div>

                <div className="space-y-4 flex-1 flex flex-col pt-4">
                    <form onSubmit={handleAddPlayer} className="flex gap-3">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Naam speler..."
                            className="flex-1 bg-white/5 border-white/10 h-14 rounded-2xl text-white placeholder:text-white/20 font-bold px-6 focus:ring-red-500/50 text-[16px]"
                            autoFocus
                        />
                        <Button type="submit" variant="secondary" size="icon" className="shrink-0 h-14 w-14 rounded-2xl bg-white text-[#140001] hover:bg-zinc-200">
                            <Plus className="w-6 h-6" strokeWidth={3} />
                        </Button>
                    </form>

                    <div className="space-y-3 flex-1 pr-2 content-start pt-4">
                        <AnimatePresence mode="popLayout">
                            {players.map((player) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center justify-between bg-white/5 p-4 rounded-[1.5rem] border border-white/10 shadow-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center text-sm font-black text-white shadow-lg border border-red-400/20">
                                            {player.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-black text-lg text-white tracking-tight italic">{player.name}</span>
                                    </div>
                                    <button
                                        onClick={() => removePlayer(player.id)}
                                        className="text-white/20 hover:text-red-500 transition-colors p-2"
                                    >
                                        <X size={20} strokeWidth={3} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {players.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem]">
                                <Users className="w-12 h-12 text-white/10" />
                                <p className="text-white/20 font-black uppercase tracking-widest text-xs italic">
                                    Voeg minimaal 3 spelers toe om te starten
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 pb-8">
                    <Button
                        onClick={startGame}
                        disabled={players.length < 3}
                        className={cn(
                            "w-full py-8 text-2xl font-black uppercase tracking-tight rounded-[2rem] transition-all shadow-2xl",
                            players.length < 3
                                ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                                : "bg-white text-[#140001] hover:bg-zinc-200 active:scale-[0.98]"
                        )}
                    >
                        START GAME <Play className="ml-3 w-6 h-6 fill-current" />
                    </Button>
                </div>
            </div>

            <GameSettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </div>
    );
}
