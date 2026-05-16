'use client';

import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function ReadPromptScreen() {
    const { prompts, players, currentPlayerIndex, startAnswering, connectionType, localPlayerId, localPlayerName } = useGameStore();

    // Always get the latest player data to ensure correct identity after sync
    const currentPlayer = (connectionType === 'JOIN' || connectionType === 'HOST')
        ? (players.find(p => p.id === localPlayerId) || players.find(p => p.name === localPlayerName) || players[0])
        : players[currentPlayerIndex];

    // Freeze only the prompts to prevent leakage, but keep the player dynamic or re-evaluate
    const [frozenPrompts] = useState(prompts);

    // Determine which prompt this player sees
    const isImposter = currentPlayer?.isImposter || false;
    const promptText = isImposter ? frozenPrompts.imposter : frozenPrompts.majority;

    // Debugging identity
    console.log('ReadPromptScreen Identity Check:', {
        localPlayerId,
        allPlayerIds: players.map(p => ({ name: p.name, id: p.id })),
        foundPlayer: players.find(p => p.id === localPlayerId)?.name,
        connectionType,
        currentPlayerIndex
    });

    return (
        <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide">
            <div className="min-h-full flex flex-col max-w-md mx-auto p-6 justify-between">
                <div className="pt-8 text-center space-y-2">
                    <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-1 rounded-full text-sm font-medium border border-red-500/30">
                        <EyeOff size={14} /> Geheime Missie
                    </div>
                    <h2 className="text-white/60 font-medium italic uppercase tracking-widest text-[10px]">Speler: <span className="text-white font-black">{currentPlayer?.name}</span></h2>
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#140001] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-800 opacity-50" />
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black italic">Jouw Vraag</p>
                    <h3 className="text-3xl font-black text-white leading-tight italic tracking-tighter">
                        "{promptText}"
                    </h3>
                </motion.div>

                <div className="pb-8 space-y-4 text-center">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">Lees stil. Laat niemand zien!</p>
                    <Button onClick={startAnswering} className="w-full py-8 text-2xl font-black uppercase rounded-[2rem] bg-white text-[#140001] hover:bg-zinc-200 shadow-2xl transition-all active:scale-[0.98]">
                        Ik ga antwoorden
                    </Button>
                </div>
            </div>
        </div>
    );
}
