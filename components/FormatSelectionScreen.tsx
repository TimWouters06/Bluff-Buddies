import { useState, useEffect } from 'react';
import { useGameStore, GameFormat } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

export default function FormatSelectionScreen() {
    const { gameFormat, setGameFormat, setGamePhase } = useGameStore();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const formats = [
        { 
            id: 'CALL_OUT', 
            label: 'CALL OUT', 
            description: 'Judge your friends,\nand find the liar.', 
            image: "/images/calloutbackground.png", 
            glowClass: 'shadow-[0_0_20px_rgba(255,85,0,0.3)]', 
            borderClass: 'border-[#FF5500]',
            gradientClass: 'from-[#FF5500]/30 to-[#4A1500]/80',
            zoomClass: "scale-110"
        },
        { 
            id: 'BY_THE_NUMBERS', 
            label: 'BY THE NUMBERS', 
            description: 'Compare the numbers,\nspot the bluff', 
            image: "/images/bythenumbersbackground.png", 
            glowClass: 'shadow-[0_0_20px_rgba(0,255,170,0.3)]', 
            borderClass: 'border-[#00FFAA]',
            gradientClass: 'from-[#00FFAA]/30 to-[#003322]/80',
            zoomClass: "scale-[1.5]"
        },
        { 
            id: 'SNAP_REACTION', 
            label: 'SNAP REACTION', 
            description: 'One clip, one word.', 
            image: "/images/snapreaction.png", 
            glowClass: 'shadow-[0_0_20px_rgba(170,0,255,0.3)]', 
            borderClass: 'border-[#AA00FF]',
            gradientClass: 'from-[#AA00FF]/30 to-[#220044]/80',
            zoomClass: "scale-[1.8]"
        },
    ];

    return (
        <div className="h-full w-full overflow-hidden bg-[#08020E] relative flex flex-col items-center">
            {/* Same Background as Home Screen */}
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
                    className="w-[100%] max-w-[500px] h-auto filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] mb-0"
                    priority
                />

                <div className="text-center flex flex-col items-center -mt-4">
                    <span className="text-white font-bold tracking-[0.3em] text-[12px] mb-0.5 leading-none">CHOOSE</span>
                    <span className="font-black tracking-[0.3em] text-[16px] text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF007F] to-[#7000FF] leading-none">
                        GAMEMODE
                    </span>
                </div>
            </div>

            {/* Buttons Area */}
            <div className="flex-1 w-full px-5 pb-4 mt-2 relative z-10 flex flex-col gap-3 items-center justify-start">
                <AnimatePresence>
                    {formats.map((format) => {
                        return (
                            <motion.button
                                key={format.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => {
                                    if (!hasMounted) return;
                                    setGameFormat(format.id as GameFormat);
                                    setTimeout(() => setGamePhase('MODE_SELECT'), 150);
                                }}
                                className={cn(
                                    "w-full max-w-[450px] shrink-0 relative rounded-[28px] overflow-hidden transition-all duration-300 flex items-center border-[2px]",
                                    format.borderClass,
                                    format.glowClass
                                )}
                                style={{
                                    aspectRatio: '3 / 1'
                                }}
                            >
                                {/* Background Gradient */}
                                <div className={cn("absolute inset-0 bg-gradient-to-r opacity-100", format.gradientClass)} />

                                {/* Background Silhouette Image (from user's assets) */}
                                <div className="absolute inset-0 opacity-100 pointer-events-none">
                                    <Image
                                        src={format.image}
                                        alt={format.label}
                                        fill
                                        className={cn("object-cover", format.zoomClass)}
                                    />
                                </div>
                                
                                {/* Inner Glass Highlights */}
                                <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                                {/* Content Container */}
                                <div className="relative z-20 w-full flex items-center justify-between px-6 h-full">
                                    
                                    {/* Center Text */}
                                    <div className="flex flex-col items-start text-left flex-1 min-w-0 pr-4">
                                        <h2 className="text-[22px] font-black text-white uppercase tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-none mb-2">
                                            {format.label}
                                        </h2>
                                        <p className="text-[14px] font-bold text-white whitespace-pre-line leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                            {format.description}
                                        </p>
                                    </div>

                                    {/* Right Arrow Button */}
                                    <div className="w-[42px] h-[42px] rounded-full bg-black/60 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                                        <ChevronRight className="text-white ml-0.5" size={24} />
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
