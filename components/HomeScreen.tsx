import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Settings, HelpCircle, Volume2, Home, Users, Smartphone } from 'lucide-react';

// --- Background ---
const BackgroundDecor = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#08020E]">
        {/* Party Image Background fading down */}
        <div 
            className="absolute -top-32 left-0 right-0 h-[80%] opacity-80 bg-[url('/images/backgroundhomescreen.png')] bg-cover bg-[center_top] bg-no-repeat z-0 blur-[1px] brightness-[0.7]" 
            style={{ 
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 95%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 95%)' 
            }} 
        />
        
        {/* Moving ambient light blobs */}
        <motion.div 
            animate={{ 
                x: [-20, 20, -20],
                y: [-10, 10, -10],
                opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[20%] w-[500px] h-[400px] bg-[#ff4400] blur-[120px] rounded-full z-0" 
        />
        <motion.div 
            animate={{ 
                x: [20, -20, 20],
                y: [10, -10, 10],
                opacity: [0.05, 0.12, 0.05]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] right-[10%] w-[600px] h-[500px] bg-[#5000ff] blur-[130px] rounded-full z-0" 
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.03, 0.08, 0.03]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#00ffcc] blur-[100px] rounded-full z-0" 
        />
        
        {/* Floating Particles Component */}
        <div className="absolute inset-0 z-10 overflow-hidden">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%",
                        opacity: Math.random() * 0.5 + 0.1,
                        scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{ 
                        y: [null, "-20%"],
                        opacity: [null, 0],
                    }}
                    transition={{ 
                        duration: Math.random() * 10 + 10, 
                        repeat: Infinity, 
                        ease: "linear",
                        delay: Math.random() * 10
                    }}
                    className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                />
            ))}
        </div>
        
        {/* Edge Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,2,14,0.9)_100%)] z-10" />
    </div>
);

// --- Button Component ---
const ActionBtn = ({ title, subtitle, icon: Icon, neonColor, bgClass, onClick, layout = 'left', isHero = false }: { 
    title: string; 
    subtitle: string; 
    icon: any;
    neonColor: string;
    bgClass: string; 
    onClick: () => void;
    layout?: 'left' | 'center';
    isHero?: boolean;
}) => (
    <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
            "relative w-full overflow-hidden transition-all duration-300",
            bgClass,
            isHero ? "h-[100px] rounded-[24px] shadow-[0_15px_30px_rgba(0,0,0,0.4)]" : "h-[75px] rounded-[18px] shadow-[0_10px_20px_rgba(0,0,0,0.3)]",
            "flex items-center px-5 border-t border-white/10"
        )}
    >
        {/* Soft top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        {/* Subtle border */}
        <div className="absolute inset-0 rounded-[16px] border border-white/10 pointer-events-none" />
        
        {layout === 'center' ? (
            <>
                <div className={cn("absolute z-10 flex items-center justify-center", isHero ? "left-6" : "left-5")}>
                    <Icon 
                        size={isHero ? 36 : 28} 
                        style={{ 
                            color: neonColor,
                            filter: `drop-shadow(0 0 8px ${neonColor})`
                        }} 
                        strokeWidth={2} 
                    />
                </div>
                <div className="relative z-10 flex flex-col items-center w-full text-center">
                    <h3 className={cn("font-bold text-white leading-none drop-shadow-md uppercase", isHero ? "text-[22px] tracking-wide mb-1" : "text-[15px] tracking-wide mb-1")}>{title}</h3>
                    <p className={cn("text-white/70 font-medium", isHero ? "text-[11px]" : "text-[10px]")}>{subtitle}</p>
                </div>
            </>
        ) : (
            <div className="relative z-10 flex items-center gap-3 w-full">
                <div className="flex items-center justify-center">
                    <Icon 
                        size={24} 
                        style={{ 
                            color: neonColor,
                            filter: `drop-shadow(0 0 6px ${neonColor})`
                        }} 
                        strokeWidth={2} 
                    />
                </div>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <h3 className="font-bold text-white leading-none drop-shadow-md uppercase text-[13px] tracking-wide mb-1 truncate w-full">{title}</h3>
                    <p className="text-white/70 font-medium text-[9px] leading-snug break-words w-full">{subtitle}</p>
                </div>
            </div>
        )}
    </motion.button>
);

export default function HomeScreen() {
    const { setGamePhase, setConnectionType, localPlayerName, setLocalPlayerName } = useGameStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [nameError, setNameError] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const handleAction = (type: 'HOST' | 'JOIN' | 'LOCAL') => {
        if (type !== 'LOCAL' && !localPlayerName.trim()) {
            setNameError(true);
            setTimeout(() => setNameError(false), 500);
            return;
        }
        setConnectionType(type);
        setTimeout(() => setGamePhase(type === 'JOIN' ? 'JOIN_LOBBY' : 'FORMAT_SELECT'), 150);
    };

    if (!hasMounted) return <div className="h-full bg-[#08020E]" />;

    return (
        <div className="h-full w-full overflow-hidden relative flex flex-col items-center bg-[#08020E]">
            <BackgroundDecor />

            {/* Main Container */}
            <div className="flex-1 w-full flex flex-col items-center px-6 pt-10 pb-8 relative z-10">
                
                {/* Logo Section */}
                <div className="w-full flex flex-col items-center mb-6">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0,
                            filter: [
                                "drop-shadow(0 10px 20px rgba(0,0,0,0.6))",
                                "drop-shadow(0 10px 30px rgba(255,107,0,0.4))",
                                "drop-shadow(0 10px 20px rgba(0,0,0,0.6))"
                            ]
                        }}
                        transition={{ 
                            opacity: { duration: 0.8 },
                            y: { duration: 0.8 },
                            filter: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="w-full max-w-[300px]"
                    >
                        <Image 
                            src="/images/new-logo.png" 
                            alt="Bluff Buddies Logo" 
                            width={1200}
                            height={600}
                            className="w-full h-auto"
                            priority
                        />
                    </motion.div>

                    {/* Subtitle Section */}
                    <div className="flex flex-col items-center text-center -mt-3 mb-5 w-full relative z-10">
                        <h2 className="text-white font-bold tracking-[0.25em] text-[12px] mb-2">LIE. LAUGH. GET CAUGHT.</h2>
                        <p className="text-white/60 text-[13px] leading-relaxed">De partygame waarin je liegt,<br/>bluft en elkaar ontmaskert.</p>
                    </div>

                    {/* Buttons Area */}
                    <div className="w-full flex flex-col gap-3 max-w-md mx-auto">
                        {/* Name Input */}
                        <motion.div 
                            animate={nameError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col mb-1 w-full"
                        >
                            <div className="flex items-center gap-4 mb-3 opacity-80">
                                <div className="h-[1px] bg-white/40 flex-1" />
                                <span className="text-white font-black text-[11px] uppercase tracking-[0.25em] drop-shadow-md">JOUW NAAM</span>
                                <div className="h-[1px] bg-white/40 flex-1" />
                            </div>
                            <input 
                                type="text"
                                value={localPlayerName}
                                onChange={(e) => {
                                    setLocalPlayerName(e.target.value);
                                    if(nameError) setNameError(false);
                                }}
                                placeholder="Typ hier je naam..."
                                maxLength={15}
                                className={cn(
                                    "w-full bg-black/60 rounded-[15px] text-white font-bold px-5 py-4 outline-none transition-all placeholder:text-white/40 text-[16px] shadow-inner border",
                                    nameError 
                                        ? "border-red-500 bg-red-950/40 shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                                        : "border-[#FF6B00]/30 shadow-[0_0_15px_rgba(255,107,0,0.1)] focus:border-[#FF6B00]/80 focus:shadow-[0_0_25px_rgba(255,107,0,0.3)] focus:bg-black/80"
                                )}
                            />
                        </motion.div>

                        <div className="flex gap-3 w-full">
                            <div className="flex-1">
                                <ActionBtn 
                                    title="HOST GAME"
                                    subtitle="Begin een nieuwe party"
                                    icon={Home}
                                    neonColor="#FF6B00"
                                    bgClass="bg-gradient-to-b from-[#804000] to-[#402000]"
                                    onClick={() => handleAction('HOST')}
                                />
                            </div>
                            <div className="flex-1">
                                <ActionBtn 
                                    title="JOIN GAME"
                                    subtitle="Sluit aan bij een kamer"
                                    icon={Users}
                                    neonColor="#00A3FF"
                                    bgClass="bg-gradient-to-b from-[#284980] to-[#122240]"
                                    onClick={() => handleAction('JOIN')}
                                />
                            </div>
                        </div>

                        <ActionBtn 
                            title="PASS & PLAY"
                            subtitle="Speel op één apparaat"
                            icon={Smartphone}
                            neonColor="#00FF66"
                            bgClass="bg-gradient-to-b from-[#3c592b] to-[#1e3012]"
                            layout="center"
                            onClick={() => handleAction('LOCAL')}
                        />
                    </div>
                </div>

                <div className="w-full flex flex-col items-center mt-auto pb-4">
                    {/* Glassmorphism Footer Bar */}
                    <div className="w-full max-w-[360px] bg-white/[0.03] backdrop-blur-xl rounded-full border border-white/10 px-4 py-3 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex justify-between items-center">
                        <button className="flex flex-col items-center gap-1.5 px-3 py-1 hover:bg-white/5 rounded-2xl transition-colors opacity-60 hover:opacity-100">
                            <Settings size={20} className="text-white" />
                            <span className="text-[8px] font-black text-white tracking-[0.15em]">INSTELLINGEN</span>
                        </button>
                        <div className="w-[1px] h-6 bg-white/10" />
                        <button className="flex flex-col items-center gap-1.5 px-3 py-1 hover:bg-white/5 rounded-2xl transition-colors opacity-60 hover:opacity-100">
                            <HelpCircle size={20} className="text-white" />
                            <span className="text-[8px] font-black text-white tracking-[0.15em]">HOE HET WERKT</span>
                        </button>
                        <div className="w-[1px] h-6 bg-white/10" />
                        <button className="flex flex-col items-center gap-1.5 px-3 py-1 hover:bg-white/5 rounded-2xl transition-colors opacity-60 hover:opacity-100">
                            <Volume2 size={20} className="text-white" />
                            <span className="text-[8px] font-black text-white tracking-[0.15em]">GELUID AAN</span>
                        </button>
                    </div>
                    
                    {/* Copyright */}
                    <div className="text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase">
                        Bluff Buddies © 2026
                    </div>
                </div>

            </div>
        </div>
    );
}
