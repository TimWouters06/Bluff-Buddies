'use client';

import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, Home, RefreshCw, Beer } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TournamentResultsScreen() {
    const { players, scores, resetGame, playAgain, drinkingRules, tournamentPenaltyLoser, tournamentPrizeWinner } = useGameStore();

    // Sort players by score
    const sortedPlayers = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
    const winner = sortedPlayers[0];
    const loser = sortedPlayers[sortedPlayers.length - 1];
    const winners = sortedPlayers.filter(p => (scores[p.id] || 0) === (scores[winner.id] || 0));

    return (
        <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide">
            <div className="min-h-full flex flex-col max-w-md mx-auto p-6 space-y-6 pb-12">
                {/* Trophy Animation */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
                    className="relative mx-auto"
                >
                    <div className="absolute inset-0 bg-red-500/30 blur-3xl rounded-full animate-pulse" />
                    <Trophy className="w-32 h-32 text-white mx-auto relative z-10 drop-shadow-[0_10px_20px_rgba(254,0,0,0.4)]" fill="currentColor" />
                </motion.div>

                {/* Winner Announcement */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center space-y-3"
                >
                    <h2 className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px] italic">TOERNOOI WINNAAR</h2>
                    <div className="bg-[#140001] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-800" />
                        <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-tight drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">
                            {winners.length === 1 ? (
                                winner.name
                            ) : (
                                winners.map(w => w.name).join(' & ')
                            )}
                        </h1>
                        <p className="text-red-500 font-black italic text-3xl mt-2 tracking-tighter">{scores[winner.id] || 0} PUNTEN!</p>
                    </div>
                </motion.div>

                {/* Final Leaderboard */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-5 shadow-2xl"
                >
                    <h3 className="text-white/20 font-black uppercase tracking-widest text-[9px] italic text-center">EINDSCORE</h3>
                    <div className="space-y-3">
                        {sortedPlayers.map((player, index) => (
                            <motion.div
                                key={player.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-[1.5rem] transition-all",
                                    index === 0 ? "bg-yellow-500 border-2 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-[1.02]" :
                                        index === sortedPlayers.length - 1 ? "bg-red-500/20 border border-red-500/30" :
                                            "bg-white/5 border border-white/5"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-lg",
                                        index === 0 ? "bg-white text-yellow-600" :
                                            index === sortedPlayers.length - 1 ? "bg-red-500/20 text-red-500" :
                                                "bg-white/10 text-white/40"
                                    )}>
                                        {index + 1}
                                    </div>
                                    <span className={cn(
                                        "font-black italic text-xl tracking-tight",
                                        index === 0 ? "text-white" :
                                            index === sortedPlayers.length - 1 ? "text-red-500" : "text-white/80"
                                    )}>{player.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-2xl font-black italic tracking-tighter",
                                        index === 0 ? "text-white" :
                                            index === sortedPlayers.length - 1 ? "text-red-500" : "text-white/60"
                                    )}>
                                        {scores[player.id] || 0}
                                    </span>
                                    <span className="text-white/20 text-[10px] font-black uppercase italic">pts</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Drinking Rules */}
                {drinkingRules && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden"
                    >
                        <div className="flex items-start gap-5 relative z-10">
                            <div className="bg-amber-500 rounded-2xl p-4 shrink-0 text-[#140001]">
                                <Beer size={32} fill="currentColor" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h4 className="font-black text-[10px] uppercase tracking-widest italic opacity-60 text-white">TOERNOOI DRINKEN!</h4>
                                <div className="space-y-1 text-white">
                                    <p className="font-black italic text-xl tracking-tight leading-none">
                                        🏆 <span className="text-yellow-500">{winner.name}</span> mag <span className="underline decoration-wavy">{tournamentPrizeWinner} {tournamentPrizeWinner === 1 ? 'slok' : 'slokken'}</span> uitdelen!
                                    </p>
                                    <p className="font-black italic text-xl tracking-tight leading-none">
                                        🍺 <span className="text-red-500">{loser.name}</span> moet <span className="underline decoration-wavy">{tournamentPenaltyLoser} {tournamentPenaltyLoser === 1 ? 'slok' : 'slokken'}</span> drinken!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="pt-4">
                    <Button
                        onClick={playAgain}
                        className="w-full py-8 text-2xl font-black uppercase rounded-[2rem] bg-white text-[#140001] hover:bg-zinc-200 shadow-2xl transition-all active:scale-[0.98] italic tracking-tighter"
                    >
                        OPNIEUW SPELEN <RefreshCw className="ml-3 w-6 h-6" strokeWidth={3} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
