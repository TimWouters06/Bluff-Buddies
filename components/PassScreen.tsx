'use client';

import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

export default function PassScreen() {
    const { players, currentPlayerIndex, nextPlayer, phase } = useGameStore();
    const currentPlayer = players[currentPlayerIndex];

    const title = phase === 'VOTE_PASS' ? "Tijd om te Stemmen!" : "Geef door";
    const subtitle = phase === 'VOTE_PASS' ? "Geef de telefoon aan" : "Geef de telefoon aan";
    const buttonText = phase === 'VOTE_PASS' ? `Ik ben ${currentPlayer?.name}` : `Ik ben ${currentPlayer?.name}`;

    return (
        <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide">
            <div className="min-h-full flex flex-col items-center justify-center max-w-md mx-auto p-6 space-y-12 text-center">
                <div className="space-y-4">
                    <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                        className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto"
                    >
                        <Smartphone className="w-12 h-12 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-wider">
                        {title}
                    </h2>
                    <p className="text-xl text-white/60">
                        {subtitle}
                    </p>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-800 rounded-3xl p-1 shadow-[0_0_30px_rgba(254,0,0,0.2)]">
                    <div className="bg-[#140001] rounded-[22px] px-12 py-6">
                        <span className="text-4xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">
                            {currentPlayer?.name}
                        </span>
                    </div>
                </div>

                <Button
                    onClick={nextPlayer}
                    size="lg"
                    className="w-full h-16 bg-white text-[#140001] hover:bg-zinc-200 text-xl font-black uppercase rounded-2xl shadow-2xl active:scale-[0.98] transition-all"
                >
                    {buttonText}
                </Button>
            </div>
        </div>
    );
}
