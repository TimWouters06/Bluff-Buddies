import { create } from 'zustand';
import { PROMPTS, NUMBER_PROMPTS, GameMode, Range } from './prompts';

export type Player = {
    id: string;
    name: string;
    isImposter: boolean;
    answer: string | null; // Round 1: Who fits the description
    vote: string | null;   // Round 2: Who they think is the imposter
    isHost?: boolean;
};

export type GameFormat = 'CALL_OUT' | 'BY_THE_NUMBERS' | 'SNAP_REACTION';
export type GamePhase = 'HOME' | 'FORMAT_SELECT' | 'MODE_SELECT' | 'SETUP' | 'LOBBY' | 'JOIN_LOBBY' | 'PASS' | 'READ' | 'ANSWER' | 'DISCUSS' | 'VOTE_PASS' | 'VOTE' | 'REVEAL' | 'RESULT' | 'TOURNAMENT_RESULTS';
export type ConnectionType = 'HOST' | 'JOIN' | 'LOCAL';

interface GameState {
    players: Player[];
    phase: GamePhase;
    currentPlayerIndex: number;
    prompts: {
        majority: string;
        imposter: string;
    };
    imposterId: string | null;
    gameFormat: GameFormat;
    gameMode: GameMode;
    drinkingRules: boolean;
    sipPenaltyBuddies: number | '';
    sipPenaltyImposter: number | '';
    tournamentMode: boolean;
    tournamentRounds: 3 | 5 | 10;
    tournamentPenaltyLoser: number | '';
    tournamentPrizeWinner: number | '';
    currentRound: number;
    scores: Record<string, number>;
    lastRoundPoints: Record<string, number>;
    usedQuestions: string[];
    connectionType: ConnectionType;
    lobbyCode: string | null;
    localPlayerId: string | null;
    localPlayerName: string;

    // Actions
    setLocalPlayerId: (id: string | null) => void;
    setLocalPlayerName: (name: string) => void;
    syncGameState: (state: Partial<GameState>) => void;
    goToModeSelect: () => void;
    setGameFormat: (format: GameFormat) => void;
    setGameMode: (mode: GameMode) => void;
    toggleDrinkingRules: () => void;
    setSipPenaltyBuddies: (sips: number | '') => void;
    setSipPenaltyImposter: (sips: number | '') => void;
    toggleTournamentMode: () => void;
    setTournamentRounds: (rounds: 3 | 5 | 10) => void;
    setTournamentPenaltyLoser: (sips: number | '') => void;
    setTournamentPrizeWinner: (sips: number | '') => void;
    addPlayer: (name: string) => void;
    removePlayer: (id: string) => void;
    startGame: () => void;
    nextPlayer: () => void;
    startAnswering: () => void;
    submitAnswer: (targetPlayerId: string) => void;
    startVoting: () => void;
    submitVote: (suspectId: string) => void;
    distributePoints: () => void;
    nextRound: () => void;
    playAgain: () => void;
    resetGame: () => void;
    confirmFormat: () => void;
    confirmMode: () => void;
    confirmOptions: () => void;
    setGamePhase: (phase: GamePhase) => void;
    setConnectionType: (type: ConnectionType) => void;
    setLobbyCode: (code: string | null) => void;
    setPlayers: (players: any[]) => void;
}

export const useGameStore = create<GameState>()((set, get) => ({
    players: [],
    phase: 'HOME',
    currentPlayerIndex: 0,
    prompts: { majority: '', imposter: '' },
    imposterId: null,
    gameFormat: 'CALL_OUT',
    gameMode: 'FAMILY',
    drinkingRules: false,
    sipPenaltyBuddies: 5,
    sipPenaltyImposter: 3,
    tournamentMode: false,
    tournamentRounds: 3,
    tournamentPenaltyLoser: 10,
    tournamentPrizeWinner: 10,
    currentRound: 0,
    scores: {},
    lastRoundPoints: {},
    usedQuestions: [],
    connectionType: 'LOCAL',
    lobbyCode: null,
    localPlayerId: null,
    localPlayerName: '',

    setLocalPlayerId: (id) => set({ localPlayerId: id }),
    setLocalPlayerName: (name) => set((state) => ({ 
        localPlayerName: name,
        localPlayerId: state.localPlayerId || Math.random().toString(36).substring(2, 11)
    })),
    syncGameState: (newState) => set((state) => ({ ...state, ...newState })),

    goToModeSelect: () => set({ phase: 'MODE_SELECT' }),
    setGameFormat: (format) => set({ gameFormat: format }),
    setGameMode: (mode) => set({ gameMode: mode }),
    toggleDrinkingRules: () => set((state) => ({
        drinkingRules: !state.drinkingRules
    })),
    setSipPenaltyBuddies: (sips) => set({ sipPenaltyBuddies: sips }),
    setSipPenaltyImposter: (sips) => set({ sipPenaltyImposter: sips }),
    toggleTournamentMode: () => set((state) => ({
        tournamentMode: !state.tournamentMode
    })),
    setTournamentRounds: (rounds) => set({ tournamentRounds: rounds }),
    setTournamentPenaltyLoser: (sips) => set({ tournamentPenaltyLoser: sips }),
    setTournamentPrizeWinner: (sips) => set({ tournamentPrizeWinner: sips }),

    confirmFormat: () => set({ phase: 'MODE_SELECT' }),
    confirmMode: () => set((state) => ({ 
        phase: state.connectionType === 'HOST' ? 'LOBBY' : 'SETUP' 
    })),
    confirmOptions: () => set((state) => ({ 
        phase: state.connectionType === 'HOST' ? 'LOBBY' : 'SETUP' 
    })),
    setGamePhase: (phase) => set({ phase }),
    setConnectionType: (type) => set({ connectionType: type }),
    setLobbyCode: (code) => set({ lobbyCode: code }),
    setPlayers: (socketPlayers) => set({ 
        players: Array.isArray(socketPlayers) ? socketPlayers.map(p => ({
            id: p?.id || Math.random().toString(),
            name: p?.name || 'Unknown',
            isImposter: p?.isImposter || false,
            answer: p?.answer || null,
            vote: p?.vote || null,
            isHost: p?.isHost || false
        })) : []
    }),

    addPlayer: (name) => set((state) => ({
        players: [...state.players, {
            id: Math.random().toString(36).substring(2, 9),
            name,
            isImposter: false,
            answer: null,
            vote: null
        }]
    })),

    removePlayer: (id) => set((state) => ({
        players: state.players.filter(p => p.id !== id)
    })),

    startGame: () => {
        const { players, gameMode, tournamentMode } = get();
        if (players.length < 3) return;

        // Select random imposter
        const imposterIndex = Math.floor(Math.random() * players.length);
        const imposterId = players[imposterIndex].id;

        // Select random distinctive prompt pair
        let promptPair: { majority: string, imposter: string };
        let newUsedQuestions: string[] = [];

        const currentFormat = get().gameFormat;
        console.log('Starting game with format:', currentFormat, 'and mode:', gameMode);

        if (currentFormat === 'BY_THE_NUMBERS') {
            const category = NUMBER_PROMPTS[gameMode];
            if (!category || typeof category !== 'object' || Array.isArray(category)) {
                console.error('Invalid category for BY_THE_NUMBERS:', category, 'mode:', gameMode);
                // Fallback to FAMILY if mode is broken
                const fallback = NUMBER_PROMPTS.FAMILY;
                const ranges = (['LOW', 'MEDIUM', 'HIGH'] as Range[]).filter(r => fallback[r] && fallback[r].length >= 2);
                const selectedRange = ranges[Math.floor(Math.random() * ranges.length)];
                const pool = fallback[selectedRange];
                promptPair = { majority: pool[0], imposter: pool[1] };
                newUsedQuestions = [pool[0], pool[1]];
            } else {
                const ranges = (['LOW', 'MEDIUM', 'HIGH'] as Range[]).filter(r => {
                    if (gameMode === 'MIX') {
                        return NUMBER_PROMPTS.FAMILY[r].length >= 2 || NUMBER_PROMPTS.EXPOSING[r].length >= 2;
                    }
                    return category[r] && category[r].length >= 2;
                });

                if (ranges.length === 0) {
                    console.error('No ranges with enough questions for mode:', gameMode);
                    const pool = NUMBER_PROMPTS.FAMILY.LOW;
                    promptPair = { majority: pool[0], imposter: pool[1] };
                    newUsedQuestions = [pool[0], pool[1]];
                } else {
                    const selectedRange = ranges[Math.floor(Math.random() * ranges.length)];
                    let pool: string[];

                    if (gameMode === 'MIX') {
                        // 25% chance to pick from EXPOSING (must be paired with EXPOSING)
                        const useExposing = Math.random() < 0.25 && NUMBER_PROMPTS.EXPOSING[selectedRange].length >= 2;
                        
                        if (useExposing) {
                            pool = NUMBER_PROMPTS.EXPOSING[selectedRange];
                        } else {
                            // Mix Family, Adult, and Dirty
                            pool = [
                                ...NUMBER_PROMPTS.FAMILY[selectedRange],
                                ...NUMBER_PROMPTS.ADULT[selectedRange],
                                ...NUMBER_PROMPTS.DIRTY[selectedRange]
                            ];
                        }
                    } else {
                        pool = category[selectedRange];
                    }

                    const index1 = Math.floor(Math.random() * pool.length);
                    let index2 = Math.floor(Math.random() * pool.length);
                    while ((index2 === index1 || pool[index2] === pool[index1]) && pool.length > 1 && new Set(pool).size > 1) {
                        index2 = Math.floor(Math.random() * pool.length);
                    }
                    promptPair = { majority: pool[index1], imposter: pool[index2] };
                    newUsedQuestions = [pool[index1], pool[index2]];
                }
            }
        } else {
            let pool: string[];
            if (gameMode === 'MIX') {
                const useExposing = Math.random() < 0.25;
                if (useExposing) {
                    pool = PROMPTS.EXPOSING;
                } else {
                    pool = [
                        ...PROMPTS.FAMILY,
                        ...PROMPTS.ADULT,
                        ...PROMPTS.DIRTY
                    ];
                }
            } else {
                pool = PROMPTS[gameMode] || PROMPTS.FAMILY;
            }

            if (!Array.isArray(pool)) {
                console.error('pool is not an array:', pool, 'mode:', gameMode);
                const fallback = PROMPTS.FAMILY;
                promptPair = { majority: fallback[0], imposter: fallback[1] };
                newUsedQuestions = [fallback[0], fallback[1]];
            } else {
                const availableQuestions = pool.filter(q => !tournamentMode || !get().usedQuestions.includes(q));
                const finalPool = availableQuestions.length >= 2 ? availableQuestions : pool;

                const index1 = Math.floor(Math.random() * finalPool.length);
                let index2 = Math.floor(Math.random() * finalPool.length);
                while ((index2 === index1 || finalPool[index2] === finalPool[index1]) && finalPool.length > 1 && new Set(finalPool).size > 1) {
                    index2 = Math.floor(Math.random() * finalPool.length);
                }
                promptPair = { majority: finalPool[index1], imposter: finalPool[index2] };
                newUsedQuestions = finalPool === pool ? [finalPool[index1], finalPool[index2]] : [...get().usedQuestions, finalPool[index1], finalPool[index2]];
            }
        }

        const finalUsedQuestions = tournamentMode ? newUsedQuestions : [];

        const newPlayers = players.map((p, index) => ({
            ...p,
            isImposter: index === imposterIndex,
            answer: null,
            vote: null
        }));

        // Initialize tournament scores if tournament mode
        const initialScores = tournamentMode
            ? Object.fromEntries(players.map(p => [p.id, 0]))
            : {};

        const newState = {
            players: newPlayers,
            imposterId,
            prompts: promptPair,
            currentPlayerIndex: 0,
            currentRound: tournamentMode ? 1 : 0,
            scores: initialScores,
            lastRoundPoints: {},
            usedQuestions: finalUsedQuestions,
            phase: get().connectionType === 'LOCAL' ? 'PASS' as GamePhase : 'READ' as GamePhase,
            drinkingRules: get().drinkingRules,
            sipPenaltyBuddies: get().sipPenaltyBuddies,
            sipPenaltyImposter: get().sipPenaltyImposter,
            tournamentMode: get().tournamentMode,
            tournamentRounds: get().tournamentRounds,
            tournamentPenaltyLoser: get().tournamentPenaltyLoser,
            tournamentPrizeWinner: get().tournamentPrizeWinner,
            gameFormat: get().gameFormat,
            gameMode: get().gameMode
        };

        set(newState);

        if (get().connectionType === 'HOST') {
            import('@/lib/socket').then(({ default: socket }) => {
                socket.emit('sync-game-state', { 
                    roomCode: get().lobbyCode, 
                    gameState: newState 
                });
            });
        }
    },

    nextPlayer: () => {
        const { phase } = get();
        if (phase === 'PASS') {
            set({ phase: 'READ' });
        } else if (phase === 'VOTE_PASS') {
            set({ phase: 'VOTE' });
        }
    },

    startAnswering: () => {
        set({ phase: 'ANSWER' });
    },

    submitAnswer: (targetPlayerId) => {
        const { players, currentPlayerIndex, connectionType, lobbyCode } = get();
        
        if (connectionType !== 'LOCAL') {
            import('@/lib/socket').then(({ default: socket }) => {
                socket.emit('submit-answer', { roomCode: lobbyCode, targetPlayerId });
            });
            return;
        }

        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex].answer = targetPlayerId;

        // If last player answered, move to DISCUSS phase
        if (currentPlayerIndex >= players.length - 1) {
            set({
                players: updatedPlayers,
                currentPlayerIndex: 0,
                phase: 'DISCUSS'
            });
        } else {
            set({
                players: updatedPlayers,
                currentPlayerIndex: currentPlayerIndex + 1,
                phase: 'PASS'
            });
        }
    },

    startVoting: () => {
        const { connectionType, lobbyCode } = get();

        const newState = {
            currentPlayerIndex: 0,
            phase: connectionType === 'LOCAL' ? 'VOTE_PASS' as GamePhase : 'VOTE' as GamePhase
        };

        set(newState);

        if (connectionType === 'HOST') {
            import('@/lib/socket').then(({ default: socket }) => {
                socket.emit('sync-game-state', { 
                    roomCode: lobbyCode, 
                    gameState: newState 
                });
            });
        }
    },

    submitVote: (suspectId) => {
        const { players, currentPlayerIndex, connectionType, lobbyCode } = get();

        if (connectionType !== 'LOCAL') {
            import('@/lib/socket').then(({ default: socket }) => {
                socket.emit('submit-vote', { roomCode: lobbyCode, suspectId });
            });
            return;
        }

        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex].vote = suspectId;

        // If last player voted, reveal
        if (currentPlayerIndex >= players.length - 1) {
            set({
                players: updatedPlayers,
                phase: 'REVEAL'
            });
        } else {
            set({
                players: updatedPlayers,
                currentPlayerIndex: currentPlayerIndex + 1,
                phase: 'VOTE_PASS'
            });
        }
    },

    distributePoints: () => {
        const { players, imposterId, scores, tournamentMode } = get();
        if (!tournamentMode || !imposterId) return;

        const newScores = { ...scores };
        const roundPoints: Record<string, number> = {};

        // Initialize round points
        players.forEach(p => { roundPoints[p.id] = 0; });

        // Count votes for each player
        const voteCounts: Record<string, number> = {};
        players.forEach(p => {
            if (p.vote) {
                voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1;
            }
        });

        // Find the maximum number of votes received by anyone
        const counts = Object.values(voteCounts);
        const maxVotes = counts.length > 0 ? Math.max(...counts) : 0;

        // Find all players who received maxVotes
        const playersWithMaxVotes = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);

        // Buddies win ONLY if the imposter is the UNIQUE player with the most votes
        const buddiesWon = playersWithMaxVotes.length === 1 && playersWithMaxVotes[0] === imposterId;

        if (!buddiesWon) {
            // Imposter wins: +3 points
            newScores[imposterId] = (newScores[imposterId] || 0) + 3;
            roundPoints[imposterId] = 3;

            // Buddies who guessed correctly still get +1
            players.forEach(p => {
                if (!p.isImposter && p.vote === imposterId) {
                    newScores[p.id] = (newScores[p.id] || 0) + 1;
                    roundPoints[p.id] = 1;
                }
            });
        } else {
            // Buddies win: everyone who voted correctly gets +1, all buddies get +1 bonus
            players.forEach(p => {
                if (!p.isImposter) {
                    let pPoints = 1; // Bonus for all buddies

                    // Extra +1 for voting correctly
                    if (p.vote === imposterId) {
                        pPoints += 1;
                    }

                    newScores[p.id] = (newScores[p.id] || 0) + pPoints;
                    roundPoints[p.id] = pPoints;
                }
            });
        }

        set({ scores: newScores, lastRoundPoints: roundPoints });
    },

    nextRound: () => {
        const { players, gameMode, tournamentMode, tournamentRounds, currentRound } = get();

        // Check if tournament is complete
        if (tournamentMode && currentRound >= tournamentRounds) {
            const newState = { phase: 'TOURNAMENT_RESULTS' as GamePhase };
            set(newState);
            
            if (get().connectionType === 'HOST') {
                import('@/lib/socket').then(({ default: socket }) => {
                    socket.emit('sync-game-state', { 
                        roomCode: get().lobbyCode, 
                        gameState: newState 
                    });
                });
            }
            return;
        }

        // Select random imposter
        const imposterIndex = Math.floor(Math.random() * players.length);
        const imposterId = players[imposterIndex].id;

        // Select random distinctive prompt pair
        let promptPair: { majority: string, imposter: string };
        let newUsedQuestions: string[] = [];

        if (get().gameFormat === 'BY_THE_NUMBERS') {
            const ranges = (['LOW', 'MEDIUM', 'HIGH'] as Range[]).filter(r => {
                if (gameMode === 'MIX') {
                    return NUMBER_PROMPTS.FAMILY[r].length >= 2 || NUMBER_PROMPTS.EXPOSING[r].length >= 2;
                }
                const category = NUMBER_PROMPTS[gameMode];
                return category[r] && category[r].length >= 2;
            });
            const selectedRange = ranges[Math.floor(Math.random() * ranges.length)];
            
            let pool: string[];
            if (gameMode === 'MIX') {
                // 25% chance to pick from EXPOSING (must be paired with EXPOSING)
                const useExposing = Math.random() < 0.25 && NUMBER_PROMPTS.EXPOSING[selectedRange].length >= 2;
                
                if (useExposing) {
                    pool = NUMBER_PROMPTS.EXPOSING[selectedRange];
                } else {
                    // Mix Family, Adult, and Dirty
                    pool = [
                        ...NUMBER_PROMPTS.FAMILY[selectedRange],
                        ...NUMBER_PROMPTS.ADULT[selectedRange],
                        ...NUMBER_PROMPTS.DIRTY[selectedRange]
                    ];
                }
            } else {
                const category = NUMBER_PROMPTS[gameMode];
                pool = category[selectedRange];
            }
            
            const index1 = Math.floor(Math.random() * pool.length);
            let index2 = Math.floor(Math.random() * pool.length);
            while ((index2 === index1 || pool[index2] === pool[index1]) && pool.length > 1 && new Set(pool).size > 1) {
                index2 = Math.floor(Math.random() * pool.length);
            }
            promptPair = { majority: pool[index1], imposter: pool[index2] };
            newUsedQuestions = [pool[index1], pool[index2]];
        } else {
            let pool: string[];
            if (gameMode === 'MIX') {
                const useExposing = Math.random() < 0.25;
                if (useExposing) {
                    pool = PROMPTS.EXPOSING;
                } else {
                    pool = [
                        ...PROMPTS.FAMILY,
                        ...PROMPTS.ADULT,
                        ...PROMPTS.DIRTY
                    ];
                }
            } else {
                pool = PROMPTS[gameMode];
            }
            
            const availableQuestions = pool.filter(q => !get().usedQuestions.includes(q));
            const finalPool = availableQuestions.length >= 2 ? availableQuestions : pool;

            const index1 = Math.floor(Math.random() * finalPool.length);
            let index2 = Math.floor(Math.random() * finalPool.length);
            while ((index2 === index1 || finalPool[index2] === finalPool[index1]) && finalPool.length > 1 && new Set(finalPool).size > 1) {
                index2 = Math.floor(Math.random() * finalPool.length);
            }
            promptPair = { majority: finalPool[index1], imposter: finalPool[index2] };
            newUsedQuestions = finalPool === pool ? [finalPool[index1], finalPool[index2]] : [...get().usedQuestions, finalPool[index1], finalPool[index2]];
        }

        const newPlayers = players.map((p, index) => ({
            ...p,
            isImposter: index === imposterIndex,
            answer: null,
            vote: null
        }));

        const newState = {
            players: newPlayers,
            imposterId,
            prompts: promptPair,
            currentPlayerIndex: 0,
            currentRound: tournamentMode ? currentRound + 1 : 0,
            lastRoundPoints: {},
            usedQuestions: newUsedQuestions,
            phase: get().connectionType === 'LOCAL' ? 'PASS' as GamePhase : 'READ' as GamePhase,
            drinkingRules: get().drinkingRules,
            sipPenaltyBuddies: get().sipPenaltyBuddies,
            sipPenaltyImposter: get().sipPenaltyImposter,
            tournamentMode: get().tournamentMode,
            tournamentRounds: get().tournamentRounds,
            tournamentPenaltyLoser: get().tournamentPenaltyLoser,
            tournamentPrizeWinner: get().tournamentPrizeWinner,
            gameFormat: get().gameFormat,
            gameMode: get().gameMode
        };

        set(newState);

        if (get().connectionType === 'HOST') {
            import('@/lib/socket').then(({ default: socket }) => {
                socket.emit('sync-game-state', { 
                    roomCode: get().lobbyCode, 
                    gameState: newState 
                });
            });
        }
    },

    resetGame: () => {
        const { connectionType, lobbyCode } = get();

        if (connectionType !== 'LOCAL') {
            import('@/lib/socket').then(({ default: socket }) => {
                socket.emit('leave-room', lobbyCode);
            });
        }

        set({
            phase: 'HOME',
            imposterId: null,
            currentPlayerIndex: 0,
            prompts: { majority: '', imposter: '' },
            usedQuestions: [],
            lobbyCode: null,
            connectionType: 'LOCAL'
        });
    },

    playAgain: () => {
        const { connectionType, lobbyCode, players } = get();

        const newState = {
            phase: connectionType === 'HOST' || connectionType === 'JOIN' ? 'LOBBY' as GamePhase : 'SETUP' as GamePhase,
            imposterId: null,
            currentPlayerIndex: 0,
            currentRound: 0,
            scores: {},
            lastRoundPoints: {},
            usedQuestions: [],
            prompts: { majority: '', imposter: '' },
            players: players.map(p => ({
                ...p,
                isImposter: false,
                answer: null,
                vote: null
            }))
        };

        set(newState);

        if (connectionType === 'HOST') {
            import('@/lib/socket').then(({ default: socket }) => {
                socket.emit('sync-game-state', { 
                    roomCode: lobbyCode, 
                    gameState: newState 
                });
            });
        }
    },
}));
