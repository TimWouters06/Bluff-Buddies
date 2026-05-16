'use client';

import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageCircle, Vote } from 'lucide-react';

export default function DiscussScreen() {
    const { prompts, players, startVoting, connectionType, gameFormat } = useGameStore();

    const canStartVoting = connectionType === 'LOCAL' || connectionType === 'HOST';

    return (
        <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide">
            <div className="min-h-full flex flex-col max-w-md mx-auto p-6 space-y-6">
                <div className="text-center space-y-3 pt-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-900/40 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                        <MessageCircle className="w-12 h-12 text-white relative z-10" strokeWidth={3} />
                    </motion.div>

                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">DISCUSSIE</h2>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">
                            Wie had een andere vraag?
                        </p>
                    </div>
                </div>

                <div className="space-y-6 flex-1 pt-4">
                    {/* The Question */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-800 opacity-50" />
                        <p className="text-[9px] text-white/30 uppercase font-black tracking-widest italic mb-2">De Vraag</p>
                        <p className="text-xl font-black text-white leading-tight italic tracking-tight">"{prompts.majority}"</p>
                    </motion.div>

                    {/* The Answers */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic pl-2">Gekozen Antwoorden</h3>
                                <div className="grid gap-3">
                                    {players.map((p, i) => {
                                        const isNumeric = gameFormat === 'BY_THE_NUMBERS';
                                        const answerDisplay = isNumeric 
                                            ? (p.answer || "?") 
                                            : (players.find(target => target.id === p.answer)?.name || "Niemand");

                                        return (
                                            <motion.div
                                                key={p.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors"
                                            >
                                                <span className="font-black text-white italic tracking-tight">{p.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white/30 text-[10px] font-black uppercase italic">antwoord</span>
                                                    <span className="text-red-400 font-black italic tracking-tight text-xl">{answerDisplay}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                    </div>
                </div>

                <div className="pt-4 pb-8 mt-auto">
                    {canStartVoting ? (
                        <Button
                            onClick={startVoting}
                            className="w-full py-8 text-2xl font-black uppercase rounded-[2rem] bg-white text-[#140001] hover:bg-zinc-200 shadow-2xl transition-all active:scale-[0.98]"
                        >
                            Start Stemmen <Vote className="ml-3 w-6 h-6" strokeWidth={3} />
                        </Button>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center">
                            <p className="text-white/60 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                Wachten op host...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
