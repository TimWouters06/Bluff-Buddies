'use client';

import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RefreshCw, Beer, Trophy, AlertTriangle, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function RevealScreen() {
    const { players, prompts, imposterId, resetGame, nextRound, drinkingRules, sipPenaltyBuddies, sipPenaltyImposter, tournamentMode, tournamentRounds, currentRound, scores, lastRoundPoints, distributePoints, connectionType } = useGameStore();

    const isHostOrLocal = connectionType === 'LOCAL' || connectionType === 'HOST';

    // Freeze round data on mount to prevent next-round leakage during exit animations
    const [frozenData] = useState({
        imposterId,
        prompts,
        players: [...players],
        currentRound
    });

    const [revealed, setRevealed] = useState(false);
    const [showFullStandings, setShowFullStandings] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Distribute points when revealed (if tournament mode)
            if (tournamentMode) {
                distributePoints();
            }
            setRevealed(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, [tournamentMode, distributePoints]);

    const imposter = frozenData.players.find(p => p.id === frozenData.imposterId);

    // Calculate Voting Results
    const voteCounts: Record<string, number> = {};
    frozenData.players.forEach(p => {
        if (p.vote) {
            voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1;
        }
    });

    // Find who got the most votes
    let maxVotes = 0;
    let mostVotedPlayerId: string | null = null;
    Object.entries(voteCounts).forEach(([id, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            mostVotedPlayerId = id;
        } else if (count === maxVotes) {
            mostVotedPlayerId = null; // Tie
        }
    });

    const imposterCaught = mostVotedPlayerId === frozenData.imposterId;

    return (
        <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide">
            <div className={cn(
                "min-h-full flex flex-col max-w-md mx-auto p-4 text-center",
                !revealed ? "justify-center" : "justify-start space-y-4"
            )}>

                {!revealed ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
                            <Loader2 className="w-20 h-20 text-red-500 animate-spin mx-auto relative z-10" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] animate-pulse">
                                STEMMEN TELLEN...
                            </h2>
                            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] italic">De spanning stijgt!</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="space-y-3 w-full pb-6"
                    >
                        {/* Winner Announcement */}
                        <div className="pt-2">
                            {imposterCaught ? (
                                <div className="bg-green-500 text-black p-4 rounded-[1.5rem] shadow-lg relative overflow-hidden">
                                    <h1 className="text-3xl font-black italic tracking-tighter uppercase relative z-10">DE BUDDIES!</h1>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 relative z-10">Imposter is ontmaskerd</p>
                                    <div className="absolute top-[-20%] right-[-5%] opacity-10 rotate-12">
                                        <Trophy size={80} />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-600 text-white p-4 rounded-[1.5rem] shadow-lg relative overflow-hidden">
                                    <h1 className="text-3xl font-black italic tracking-tighter uppercase relative z-10">DE IMPOSTER!</h1>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 relative z-10">Iedereen om de tuin geleid</p>
                                    <div className="absolute top-[-20%] right-[-5%] opacity-10 rotate-12">
                                        <AlertTriangle size={80} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reveal Card */}
                        <div className="bg-white/5 border border-white/10 p-4 rounded-[2rem] space-y-4 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-800 opacity-50" />
                            <div>
                                <p className="text-white/20 text-[9px] uppercase font-black tracking-widest italic mb-1">De Imposter was</p>
                                <div className="text-4xl font-black text-white italic tracking-tighter drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">{imposter?.name}</div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 text-left">
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <p className="text-red-400/60 text-[8px] uppercase font-black tracking-widest italic">Imposter Vraag</p>
                                    <p className="text-sm font-black italic tracking-tight text-white/90">"{frozenData.prompts.imposter}"</p>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <p className="text-white/30 text-[8px] uppercase font-black tracking-widest italic">Jullie Vraag</p>
                                    <p className="text-sm font-black italic tracking-tight text-white/90">"{frozenData.prompts.majority}"</p>
                                </div>
                            </div>
                        </div>

                        {/* Tournament Standings */}
                        {tournamentMode && (
                            <div className="bg-white/5 border border-white/10 p-4 rounded-[2rem] space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="font-black text-white/30 text-[9px] uppercase tracking-widest italic">HUIDIGE STAND</h4>
                                    <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                                        <Trophy size={10} className="text-red-400" />
                                        <span className="text-red-300 font-black italic text-[9px]">Ronde {frozenData.currentRound}/{tournamentRounds}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5 overflow-y-auto max-h-[200px] pr-1 custom-scrollbar">
                                    {(() => {
                                        const sorted = [...frozenData.players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
                                        let displayPlayers = sorted;
                                        let showGap = false;

                                        if (sorted.length > 4 && !showFullStandings) {
                                            const top3 = sorted.slice(0, 3);
                                            const last = sorted[sorted.length - 1];
                                            displayPlayers = [...top3, last];
                                            showGap = true;
                                        }

                                        return displayPlayers.map((p, i) => {
                                            const originalIndex = sorted.findIndex(s => s.id === p.id);
                                            const isFirst = originalIndex === 0;
                                            const isLast = originalIndex === sorted.length - 1;
                                            const isInGap = showGap && i === 3;

                                            return (
                                                <motion.div
                                                    layout
                                                    key={p.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                >
                                                    {isInGap && (
                                                        <button
                                                            onClick={() => setShowFullStandings(true)}
                                                            className="w-full flex justify-center py-2 group transition-all"
                                                        >
                                                            <div className="flex gap-1 group-hover:scale-125 transition-transform">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-red-500 transition-colors" />
                                                                <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-red-500 transition-colors" />
                                                                <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-red-500 transition-colors" />
                                                            </div>
                                                        </button>
                                                    )}
                                                    <div className={cn(
                                                        "flex justify-between items-center bg-white/5 p-2 px-3 rounded-xl border border-white/5",
                                                        isFirst && "bg-yellow-500/5 border-yellow-500/20",
                                                        isLast && sorted.length > 1 && "bg-red-500/5 border-red-500/20"
                                                    )}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-[10px] font-black italic",
                                                                isFirst ? "text-yellow-500" : "text-white/20"
                                                            )}>#{originalIndex + 1}</span>
                                                            <span className={cn(
                                                                "font-black italic text-xs tracking-tight",
                                                                isFirst ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" :
                                                                    isLast && sorted.length > 1 ? "text-red-500" : "text-white"
                                                            )}>{p.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {lastRoundPoints[p.id] > 0 && (
                                                                <span className="text-[9px] font-black italic text-white/30">+{lastRoundPoints[p.id]}</span>
                                                            )}
                                                            <span className={cn(
                                                                "font-black italic text-xs",
                                                                isFirst ? "text-yellow-500" : isLast && sorted.length > 1 ? "text-red-500" : "text-white"
                                                            )}>{scores[p.id] || 0} pts</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        });
                                    })()}
                                </div>
                                <div className="h-px bg-white/5 w-full my-1" />
                                <div className="px-2 space-y-1">
                                    <div className="text-[8px] font-black uppercase text-white/20 italic text-left">Puntenverdeling</div>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] italic font-black">
                                        {imposterCaught ? (
                                            <>
                                                <div className="text-green-400">Buddies Win: +1</div>
                                                <div className="text-white/40">Correct stem: +1</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-red-400">Imposter Wint: +3</div>
                                                <div className="text-white/40">Correct stem: +1</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Drinking Penalty */}
                        {drinkingRules && !tournamentMode && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="bg-amber-500 text-[#140001] p-4 rounded-[1.5rem] flex items-center gap-4 text-left shadow-lg"
                            >
                                <div className="bg-black/10 rounded-xl p-2.5 shrink-0">
                                    <Beer size={24} fill="currentColor" />
                                </div>
                                <p className="text-base font-black leading-tight italic tracking-tight">
                                    {imposterCaught
                                        ? <>{imposter?.name} drinkt <span className="underline decoration-wavy">{sipPenaltyImposter} {sipPenaltyImposter === 1 ? 'slok' : 'slokken'}</span></>
                                        : <>Buddies drinken <span className="underline decoration-wavy">{sipPenaltyBuddies} {sipPenaltyBuddies === 1 ? 'slok' : 'slokken'}</span></>
                                    }
                                </p>
                            </motion.div>
                        )}

                        <div className="pt-2 mt-4">
                            {isHostOrLocal ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button onClick={() => {
                                        if (window.confirm("Weet je zeker dat je wilt stoppen? De lobby eindigt als je weggaat.")) {
                                            resetGame();
                                        }
                                    }} variant="outline" className="border-white/10 bg-white/5 text-white/30 hover:bg-white/10 hover:text-white h-12 rounded-xl font-black uppercase italic tracking-widest text-[9px]">
                                        <X className="mr-1.5 w-4 h-4" strokeWidth={3} /> Stoppen
                                    </Button>
                                    <Button onClick={nextRound} className="h-12 bg-white text-[#140001] hover:bg-zinc-200 text-base font-black uppercase rounded-xl shadow-xl active:scale-[0.98] transition-all italic tracking-tighter">
                                        {tournamentMode && frozenData.currentRound >= tournamentRounds ? 'Eindstand' : 'Next Round'} <RefreshCw className="ml-1.5 w-4 h-4" strokeWidth={3} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center">
                                    <p className="text-white/60 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                        Wachten op host...
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
