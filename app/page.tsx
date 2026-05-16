'use client';

import { useGameStore } from '@/lib/store';
import SetupScreen from '@/components/SetupScreen';
import PassScreen from '@/components/PassScreen';
import ReadPromptScreen from '@/components/ReadPromptScreen';
import AnswerScreen from '@/components/AnswerScreen';
import RevealScreen from '@/components/RevealScreen';
import FormatSelectionScreen from '@/components/FormatSelectionScreen';
import ModeSelectionScreen from '@/components/ModeSelectionScreen';
import DiscussScreen from '@/components/DiscussScreen';
import VoteScreen from '@/components/VoteScreen';
import TournamentResultsScreen from '@/components/TournamentResultsScreen';
import HomeScreen from '@/components/HomeScreen';
import LobbyScreen from '@/components/LobbyScreen';
import JoinScreen from '@/components/JoinScreen';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import socket from '@/lib/socket';
import { X } from 'lucide-react';

export default function Home() {
  const { phase, setGamePhase, setPlayers, connectionType, syncGameState, resetGame } = useGameStore();

  useEffect(() => {
    if (connectionType === 'LOCAL') return;

    const handleAllAnswers = () => setGamePhase('DISCUSS');
    const handleAllVotes = () => setGamePhase('REVEAL');
    const handlePlayersUpdated = (updatedPlayers: any[]) => setPlayers(updatedPlayers);
    const handleGameStateSynced = (gameState: any) => syncGameState(gameState);
    
    const handleRoomClosed = () => {
      alert("De host heeft het spel beëindigd.");
      resetGame();
    };

    socket.on('all-answers-submitted', handleAllAnswers);
    socket.on('all-votes-submitted', handleAllVotes);
    socket.on('players-updated', handlePlayersUpdated);
    socket.on('game-state-synced', handleGameStateSynced);
    socket.on('room-closed', handleRoomClosed);

    return () => {
      socket.off('all-answers-submitted', handleAllAnswers);
      socket.off('all-votes-submitted', handleAllVotes);
      socket.off('players-updated', handlePlayersUpdated);
      socket.off('game-state-synced', handleGameStateSynced);
      socket.off('room-closed', handleRoomClosed);
    };
  }, [connectionType, setGamePhase, setPlayers, syncGameState, resetGame]);

  return (
    <main className="h-[100dvh] bg-[#08020E] text-white flex flex-col relative selection:bg-red-500/30 overflow-hidden w-full">
      {/* Background Decor - Red Theme Optimized */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(254,0,0,0.15)_0%,rgba(0,0,0,0)_70%)] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(254,0,0,0.1)_0%,rgba(0,0,0,0)_70%)] rounded-full pointer-events-none" />
      
      {/* Leave Button */}
      {phase !== 'HOME' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            if (confirm("Weet je zeker dat je het spel wilt verlaten?")) {
              resetGame();
            }
          }}
          className="absolute top-6 left-6 z-[100] p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/40"
          title="Verlaat spel"
        >
          <X size={20} />
        </motion.button>
      )}

      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === 'HOME' && (
            <motion.div key="home" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <HomeScreen />
            </motion.div>
          )}
          {phase === 'FORMAT_SELECT' && (
            <motion.div key="format" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <FormatSelectionScreen />
            </motion.div>
          )}
          {phase === 'MODE_SELECT' && (
            <motion.div key="mode" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }}>
              <ModeSelectionScreen />
            </motion.div>
          )}
          {phase === 'LOBBY' && (
            <motion.div key="lobby" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <LobbyScreen />
            </motion.div>
          )}
          {phase === 'JOIN_LOBBY' && (
            <motion.div key="join" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <JoinScreen />
            </motion.div>
          )}
          {phase === 'SETUP' && (
            <motion.div key="setup" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <SetupScreen />
            </motion.div>
          )}
          {(phase === 'PASS' || phase === 'VOTE_PASS') && (
            <motion.div key="pass" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
              <PassScreen />
            </motion.div>
          )}
          {phase === 'READ' && (
            <motion.div key="read" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ReadPromptScreen />
            </motion.div>
          )}
          {phase === 'ANSWER' && (
            <motion.div key="answer" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnswerScreen />
            </motion.div>
          )}
          {phase === 'DISCUSS' && (
            <motion.div key="discuss" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <DiscussScreen />
            </motion.div>
          )}
          {phase === 'VOTE' && (
            <motion.div key="vote" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <VoteScreen />
            </motion.div>
          )}
          {phase === 'REVEAL' && (
            <motion.div key="reveal" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RevealScreen />
            </motion.div>
          )}
          {phase === 'TOURNAMENT_RESULTS' && (
            <motion.div key="tournament-results" className="flex-1 flex flex-col h-full overflow-hidden" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <TournamentResultsScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
