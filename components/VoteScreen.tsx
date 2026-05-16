'use client';

import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function VoteScreen() {
    const { players, prompts, currentPlayerIndex, submitVote, connectionType, localPlayerId, gameFormat } = useGameStore();
    
    const getPlayer = () => {
        if (connectionType === 'LOCAL') return players[currentPlayerIndex];
        return players.find(p => p.id === localPlayerId) || players[0];
    };

    const currentPlayer = getPlayer();
    const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleSubmit = () => {
        if (selectedSuspectId) {
            submitVote(selectedSuspectId);
            if (connectionType !== 'LOCAL') {
                setHasSubmitted(true);
            }
        }
    };

    if (hasSubmitted) {
        return (
            <div className="h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Wachten op Stemmen...</h2>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {players.filter(p => p.vote !== null).length} van de {players.length} hebben gestemd
                </p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide">
            <div className="min-h-full flex flex-col max-w-md mx-auto p-6 space-y-6">
                <div className="text-center space-y-1 pt-6">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">WIE HAD EEN ANDERE VRAAG?</h2>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">Breng je stem uit op de Imposter</p>
                </div>

                <div className="bg-[#140001] p-5 rounded-[1.5rem] border border-white/10 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-800 opacity-50" />
                    <div className="text-[9px] text-white/30 uppercase font-black tracking-widest italic mb-2">De Vraag was</div>
                    <div className="text-lg font-black text-white italic tracking-tight">"{prompts.majority}"</div>
                </div>

                <div className="grid grid-cols-1 gap-3 flex-1 content-start">
                    {players.map((p) => {
                        const isNumeric = gameFormat === 'BY_THE_NUMBERS';
                        const choiceDisplay = isNumeric 
                            ? (p.answer || "?") 
                            : (players.find(target => target.id === p.answer)?.name || "Niemand");
                        const isMe = p.id === currentPlayer.id;

                        return (
                            <motion.button
                                key={p.id}
                                disabled={isMe}
                                onClick={() => setSelectedSuspectId(p.id)}
                                whileTap={!isMe ? { scale: 0.98 } : {}}
                                className={cn(
                                    "p-4 rounded-[1.5rem] border transition-all duration-300 flex flex-col gap-1 group relative overflow-hidden",
                                    selectedSuspectId === p.id
                                        ? "bg-red-600 border-red-400 shadow-xl z-10 scale-[1.02]"
                                        : "bg-white/5 border-white/10 hover:bg-white/10",
                                    isMe && "opacity-50 grayscale cursor-not-allowed border-dashed border-white/5"
                                )}
                            >
                                <div className="flex items-center justify-between w-full relative z-10">
                                    <span className={cn(
                                        "text-xl font-black italic tracking-tight flex items-center gap-2",
                                        selectedSuspectId === p.id ? "text-white" : "text-white/60"
                                    )}>
                                        {p.name} {isMe && <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded-lg text-red-500 font-black uppercase italic tracking-widest">(JIJ)</span>}
                                    </span>

                                    <div className={cn(
                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                        selectedSuspectId === p.id ? "bg-white border-white" : "border-white/20"
                                    )}>
                                        {selectedSuspectId === p.id && <div className="w-3 h-3 bg-red-600 rounded-full" />}
                                    </div>
                                </div>

                                <div className={cn(
                                    "text-[10px] font-black uppercase italic tracking-widest relative z-10",
                                    selectedSuspectId === p.id ? "text-white/60" : "text-white/30"
                                )}>
                                    {isMe ? (
                                        <span className="text-red-400">Je kan niet op jezelf stemmen</span>
                                    ) : (
                                        <>Antwoord: <span className={cn("font-black text-lg", selectedSuspectId === p.id ? "text-white" : "text-red-400")}>{choiceDisplay}</span></>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                <div className="pt-4 pb-8">
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedSuspectId}
                        className={cn(
                            "w-full py-8 text-2xl font-black uppercase rounded-[2rem] transition-all shadow-2xl",
                            !selectedSuspectId
                                ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                : "bg-white text-[#140001] hover:bg-zinc-200 active:scale-[0.98]"
                        )}
                    >
                        Stem op {players.find(p => p.id === selectedSuspectId)?.name || "..."}
                    </Button>
                </div>
            </div>
        </div>
    );
}
