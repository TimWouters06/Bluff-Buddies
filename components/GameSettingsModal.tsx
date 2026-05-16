import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Beer, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GameSettingsModal({ isOpen, onClose }: GameSettingsModalProps) {
    const {
        drinkingRules, toggleDrinkingRules,
        sipPenaltyBuddies, setSipPenaltyBuddies,
        sipPenaltyImposter, setSipPenaltyImposter,
        tournamentMode, toggleTournamentMode,
        tournamentRounds, setTournamentRounds,
        tournamentPenaltyLoser, setTournamentPenaltyLoser,
        tournamentPrizeWinner, setTournamentPrizeWinner
    } = useGameStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#140001] rounded-t-[2.5rem] p-6 pb-12 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.6)]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
                                    Game Settings
                                </h2>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                    Pas je spel aan
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div
                                className={cn(
                                    "w-full rounded-[1.5rem] border-2 transition-all duration-300 overflow-hidden",
                                    drinkingRules
                                        ? "bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                        : "bg-white/5 border-white/10"
                                )}
                            >
                                <button
                                    onClick={toggleDrinkingRules}
                                    className="w-full flex items-center justify-between p-5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-xl transition-colors",
                                            drinkingRules ? "bg-amber-500 text-black" : "bg-white/10 text-white/40"
                                        )}>
                                            <Beer size={24} fill={drinkingRules ? "currentColor" : "none"} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className={cn("text-lg font-black uppercase tracking-tight transition-colors", drinkingRules ? "text-amber-500" : "text-white/40")}>
                                                Drankspel
                                            </h3>
                                            <p className={cn("text-[10px] font-bold opacity-60 transition-colors", drinkingRules ? "text-amber-300" : "text-white/40")}>
                                                {tournamentMode ? "Prijs en straf aan eind" : "Verliezers drinken!"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        drinkingRules ? "bg-amber-500 border-amber-500" : "border-white/20"
                                    )}>
                                        {drinkingRules && <div className="w-2 h-2 bg-black rounded-full" />}
                                    </div>
                                </button>

                                {drinkingRules && (
                                    <motion.div
                                        layout
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="px-5 pb-5 pt-2 border-t border-amber-500/30 space-y-4"
                                    >
                                        <div>
                                            <div className="text-[9px] text-amber-300 mb-2 font-black uppercase tracking-widest">
                                                {tournamentMode ? "Straf (slokken) Verliezer - Toernooi" : "Slokken voor Buddies"}
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                value={tournamentMode ? tournamentPenaltyLoser : sipPenaltyBuddies}
                                                onChange={(e) => {
                                                    const valStr = e.target.value;
                                                    const val = valStr === '' ? '' : parseInt(valStr);
                                                    if (tournamentMode) setTournamentPenaltyLoser(val);
                                                    else setSipPenaltyBuddies(val);
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-center focus:outline-none focus:border-amber-500/50"
                                            />
                                        </div>
                                        
                                        <div>
                                            <div className="text-[9px] text-amber-300 mb-2 font-black uppercase tracking-widest">
                                                {tournamentMode ? "Prijs (uitdelen) Winnaar - Toernooi" : "Slokken voor Imposter"}
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                value={tournamentMode ? tournamentPrizeWinner : sipPenaltyImposter}
                                                onChange={(e) => {
                                                    const valStr = e.target.value;
                                                    const val = valStr === '' ? '' : parseInt(valStr);
                                                    if (tournamentMode) setTournamentPrizeWinner(val);
                                                    else setSipPenaltyImposter(val);
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-center focus:outline-none focus:border-amber-500/50"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div
                                className={cn(
                                    "w-full rounded-[1.5rem] border-2 transition-all duration-300 overflow-hidden",
                                    tournamentMode
                                        ? "bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                        : "bg-white/5 border-white/10"
                                )}
                            >
                                <button
                                    onClick={toggleTournamentMode}
                                    className="w-full flex items-center justify-between p-5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-xl transition-colors",
                                            tournamentMode ? "bg-purple-500 text-black" : "bg-white/10 text-white/40"
                                        )}>
                                            <Trophy size={24} fill={tournamentMode ? "currentColor" : "none"} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className={cn("text-lg font-black uppercase tracking-tight transition-colors", tournamentMode ? "text-white" : "text-white/40")}>
                                                Toernooi
                                            </h3>
                                            <p className={cn("text-[10px] font-bold opacity-60 transition-colors", tournamentMode ? "text-purple-300" : "text-white/40")}>
                                                Speel voor punten
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        tournamentMode ? "bg-purple-500 border-purple-500" : "border-white/20"
                                    )}>
                                        {tournamentMode && <div className="w-2 h-2 bg-black rounded-full" />}
                                    </div>
                                </button>

                                {tournamentMode && (
                                    <motion.div
                                        layout
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="px-5 pb-5 pt-2 border-t border-purple-500/30"
                                    >
                                        <div className="text-[9px] text-purple-300 mb-2 font-black uppercase tracking-widest">
                                            Aantal Rondes
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[3, 5, 10].map(count => (
                                                <button
                                                    key={count}
                                                    onClick={() => setTournamentRounds(count as 3 | 5 | 10)}
                                                    className={cn(
                                                        "py-2.5 rounded-lg font-black transition-all text-xs",
                                                        tournamentRounds === count
                                                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/40"
                                                            : "bg-white/5 text-white/40 hover:bg-white/10"
                                                    )}
                                                >
                                                    {count}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={onClose}
                            className="w-full mt-6 bg-white text-[#140001] hover:bg-zinc-200 font-black uppercase py-6 rounded-xl shadow-xl active:scale-[0.98] transition-all text-lg"
                        >
                            Opslaan
                        </Button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
