import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { GameMode } from '@/lib/prompts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import socket from '@/lib/socket';
import { Loader2 } from 'lucide-react';

export default function ModeSelectionScreen() {
    const { gameMode, setGameMode, confirmMode, connectionType, setLobbyCode, setPlayers, localPlayerName } = useGameStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const modes = [
        { 
            id: 'FAMILY' as GameMode, 
            label: 'FAMILIE', 
            image: "/images/FAMILY.png", 
            glowClass: 'shadow-[0_0_20px_rgba(0,255,100,0.3)]', 
            borderClass: 'border-[#00FF66]',
            gradientClass: 'from-[#00FF66]/30 to-[#003311]/80'
        },
        { 
            id: 'ADULT' as GameMode, 
            label: 'VOLWASSEN', 
            image: "/images/mode_adult.png", 
            glowClass: 'shadow-[0_0_20px_rgba(255,107,0,0.3)]', 
            borderClass: 'border-[#FF6B00]',
            gradientClass: 'from-[#FF6B00]/30 to-[#402000]/80'
        },
        { 
            id: 'DIRTY' as GameMode, 
            label: 'DIRTY', 
            image: "/images/mode_sexy.png", 
            glowClass: 'shadow-[0_0_20px_rgba(255,0,200,0.3)]', 
            borderClass: 'border-[#FF00CC]',
            gradientClass: 'from-[#FF00CC]/30 to-[#330022]/80'
        },
        { 
            id: 'EXPOSING' as GameMode, 
            label: 'EXPOSING', 
            image: "/images/mode_mix.png", 
            glowClass: 'shadow-[0_0_20px_rgba(0,200,255,0.3)]', 
            borderClass: 'border-[#00CCFF]',
            gradientClass: 'from-[#00CCFF]/30 to-[#002233]/80'
        },
        { 
            id: 'MIX' as GameMode, 
            label: 'MIX', 
            image: "/images/new-logo.png", 
            glowClass: 'shadow-[0_0_20px_rgba(255,215,0,0.3)]', 
            borderClass: 'border-[#FFD700]',
            gradientClass: 'from-[#FFD700]/30 to-[#403000]/80'
        },
    ];

    const handleSelect = (modeId: GameMode) => {
        if (!hasMounted || isCreatingRoom) return;
        setGameMode(modeId);
        
        if (connectionType === 'HOST') {
            setIsCreatingRoom(true);
            const { localPlayerId, localPlayerName } = useGameStore.getState();
            const actualId = localPlayerId || Math.random().toString(36).substring(2, 11);
            if (!localPlayerId) useGameStore.setState({ localPlayerId: actualId });

            console.log('Creating room with identity:', { localPlayerId: actualId, hostName: localPlayerName });

            socket.emit('create-room', { hostName: localPlayerName || 'Host', playerId: actualId }, (response: any) => {
                if (response.success) {
                    setLobbyCode(response.roomCode);
                    setPlayers(response.players);
                    confirmMode();
                } else {
                    console.error('Failed to create room');
                    setIsCreatingRoom(false);
                }
            });
        } else {
            setTimeout(() => confirmMode(), 150);
        }
    };

    return (
        <div className="h-full w-full overflow-hidden bg-[#08020E] relative flex flex-col items-center">
            {/* Same Background as Home & Format Screens */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div 
                    className="absolute -top-32 left-0 right-0 h-[80%] opacity-80 bg-[url('/images/backgroundhomescreen.png')] bg-cover bg-[center_top] bg-no-repeat z-0" 
                    style={{ 
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 5%, rgba(0,0,0,0) 80%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 5%, rgba(0,0,0,0) 80%)' 
                    }} 
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,2,14,0.95)_100%)] z-10" />
            </div>

            {/* Header Content */}
            <div className="relative z-10 pt-4 pb-1 flex flex-col items-center w-full mx-auto px-6">
                <Image 
                    src="/images/new-logo.png" 
                    alt="Bluff Buddies Logo" 
                    width={1200}
                    height={600}
                    className="w-[100%] max-w-[260px] h-auto filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-1"
                    priority
                />

                <div className="text-center flex flex-col items-center mt-0">
                    <span className="text-white font-bold tracking-[0.3em] text-[12px] mb-0.5 leading-none">KIES</span>
                    <span className="font-black tracking-[0.3em] text-[16px] text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF007F] to-[#7000FF] leading-none">
                        HET THEMA
                    </span>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 w-full px-6 pb-6 mt-4 relative z-10 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-[420px]">
                    <AnimatePresence>
                        {modes.map((mode, index) => {
                            const isSelected = gameMode === mode.id;
                            const isFullWidth = mode.id === 'MIX';
                            return (
                                <motion.button
                                    key={mode.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSelect(mode.id)}
                                    className={cn(
                                        "relative rounded-[24px] overflow-hidden transition-all duration-300 flex flex-col items-center justify-center border-[2px]",
                                        isFullWidth ? "col-span-2 h-[80px]" : "aspect-square",
                                        mode.borderClass,
                                        mode.glowClass,
                                        isSelected && "scale-105 z-10 brightness-110 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                    )}
                                >
                                    {/* Background Gradient */}
                                    <div className={cn("absolute inset-0 bg-gradient-to-b opacity-100", mode.gradientClass)} />

                                    {/* Silhouette/Background Image */}
                                    <div className="absolute inset-0 opacity-80 pointer-events-none">
                                        <Image
                                            src={mode.image}
                                            alt={mode.label}
                                            fill
                                            className="object-cover scale-110"
                                        />
                                    </div>
                                    
                                    {/* Dark Overlay for Text Contrast */}
                                    <div className="absolute inset-0 bg-black/20 z-10" />
                                    
                                    {/* Glass Highlights */}
                                    <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />

                                    {/* Text Content */}
                                    <div className="relative z-20 flex flex-col items-center text-center">
                                        <span 
                                            className="text-white font-black text-[22px] tracking-[0.15em] leading-none mb-1"
                                            style={{ 
                                                textShadow: `0 0 10px rgba(255,255,255,0.4), 0 0 20px ${mode.borderClass.split('#')[1] ? '#' + mode.borderClass.split('#')[1].split(']')[0] : 'white'}` 
                                            }}
                                        >
                                            {mode.label}
                                        </span>
                                        {isSelected && isCreatingRoom && (
                                            <Loader2 className="w-6 h-6 text-white animate-spin mt-2 drop-shadow-md" />
                                        )}
                                    </div>

                                    {/* Selection Glow */}
                                    {isSelected && (
                                        <div className="absolute inset-0 border-4 border-white opacity-40 pointer-events-none rounded-[22px]" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
