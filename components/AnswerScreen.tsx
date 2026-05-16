'use client';

import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function AnswerScreen() {
    const { players, currentPlayerIndex, submitAnswer, connectionType, localPlayerId, localPlayerName, gameFormat } = useGameStore();
 
    const currentPlayer = (connectionType === 'JOIN' || connectionType === 'HOST')
        ? (players.find(p => p.id === localPlayerId) || players.find(p => p.name === localPlayerName) || players[0])
        : players[currentPlayerIndex];

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [numericValue, setNumericValue] = useState<string>("");
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const isNumeric = gameFormat === 'BY_THE_NUMBERS';

    const handleSubmit = () => {
        if (isNumeric) {
            if (numericValue !== "") {
                submitAnswer(numericValue);
                if (connectionType !== 'LOCAL') setHasSubmitted(true);
            }
        } else if (selectedId) {
            submitAnswer(selectedId);
            if (connectionType !== 'LOCAL') setHasSubmitted(true);
        }
    };

    if (hasSubmitted) {
        return (
            <div className="h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Wachten op Anderen...</h2>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {players.filter(p => p.answer !== null).length} van de {players.length} hebben geantwoord
                </p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide">
            <div className="min-h-full flex flex-col max-w-md mx-auto p-6 space-y-6">
                <div className="text-center space-y-1 pt-6 text-white">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">BEVESTIG JE KEUZE</h2>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">Wie past bij de vraag?</p>
                </div>

                {isNumeric ? (
                    <div className="flex-1 flex flex-col justify-center space-y-6 pt-4">
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center space-y-2 shadow-inner">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">Jouw Antwoord</p>
                            <input 
                                type="number"
                                value={numericValue}
                                onChange={(e) => setNumericValue(e.target.value)}
                                placeholder="0"
                                className="bg-transparent text-6xl font-black text-white text-center w-full focus:outline-none placeholder:text-white/5"
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "✓"].map((key) => (
                                <motion.button
                                    key={key}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        if (key === "C") setNumericValue("");
                                        else if (key === "✓") handleSubmit();
                                        else setNumericValue(prev => prev + key);
                                    }}
                                    className={cn(
                                        "h-16 rounded-2xl flex items-center justify-center text-xl font-black italic transition-all",
                                        key === "✓" ? "bg-red-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                                    )}
                                >
                                    {key}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 flex-1 content-start pt-4">
                        {players.map((p) => (
                            <motion.button
                                key={p.id}
                                onClick={() => setSelectedId(p.id)}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "p-5 rounded-[1.5rem] border transition-all duration-300 flex items-center justify-between group",
                                    selectedId === p.id
                                        ? "bg-red-600 border-red-400 shadow-[0_10px_20px_rgba(254,0,0,0.2)] scale-[1.02] z-10"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 focus:ring-2 focus:ring-red-500/30"
                                )}
                            >
                                <span className={cn(
                                    "text-xl font-black italic tracking-tight transition-colors",
                                    selectedId === p.id ? "text-white" : "text-white/60 group-hover:text-white/80"
                                )}>
                                    {p.name}
                                </span>
                                <div className={cn(
                                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                    selectedId === p.id ? "bg-white border-white" : "border-white/20"
                                )}>
                                    {selectedId === p.id && <div className="w-3 h-3 bg-red-600 rounded-full" />}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}

                <div className="pt-4 pb-8">
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedId}
                        className={cn(
                            "w-full py-8 text-2xl font-black uppercase rounded-[2rem] transition-all shadow-2xl",
                            !selectedId
                                ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                : "bg-white text-[#140001] hover:bg-zinc-200 active:scale-[0.98]"
                        )}
                    >
                        Bevestig Keuze
                    </Button>
                </div>
            </div>
        </div>
    );
}
