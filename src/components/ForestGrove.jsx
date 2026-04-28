import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Zap, Sprout, Wind, CalendarDays } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ForestGrove = ({ progress, isRunning, mode }) => {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const leavesRef = useRef([]);
    const [showFinish, setShowFinish] = useState(false);
    const [hoveredTree, setHoveredTree] = useState(null);
    const { user } = useAuth();
    
    const percentage = Math.min(Math.max(progress || 0, 0), 1);
    const isPomodoro = mode === 'pomodoro';

    // Extract established trees from user sessions or local storage
    const { establishedTrees, totalTrees } = useMemo(() => {
        let sessionsToUse = user?.sessions || [];
        if (!user) {
            try {
                sessionsToUse = JSON.parse(localStorage.getItem('focusSessions') || '[]');
            } catch (e) {}
        }

        // Filter out valid pomodoro sessions that grew a tree
        const pomodoroSessions = sessionsToUse.filter(s => s.mode === 'pomodoro');
        
        const trees = pomodoroSessions.map((s, i) => {
            // Generate a pseudo-random position based on index so they don't jump around
            const seed = (i * 137.5) % 100; 
            const heightSeed = (i * 41.3) % 30;
            return {
                id: `tree-${i}`,
                task: s.task || 'Focus Session',
                date: new Date(s.timestamp || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                x: `${seed}%`,
                bottom: `${40 + heightSeed}px`,
                scale: 0.7 + ((seed % 50) / 100),
                zIndex: Math.floor(100 - heightSeed)
            };
        });
        
        return {
            establishedTrees: trees.slice(-30),
            totalTrees: user?.treesPlanted || pomodoroSessions.length
        };
    }, [user]);

    const baseTrees = totalTrees;

    // Show finish animation
    useEffect(() => {
        if (percentage >= 1 && !showFinish && isPomodoro) {
            setShowFinish(true);
            setTimeout(() => setShowFinish(false), 4000);
        }
    }, [percentage, isPomodoro]);

    // Canvas animation for forest background and growing tree
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        const GROUND_Y = H * 0.75;

        const drawFrame = () => {
            ctx.clearRect(0, 0, W, H);

            // Sky gradient
            const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
            sky.addColorStop(0, '#0f172a'); // slate-900
            sky.addColorStop(1, '#1e293b'); // slate-800
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, W, GROUND_Y);

            // Ground gradient
            const ground = ctx.createLinearGradient(0, GROUND_Y, 0, H);
            ground.addColorStop(0, '#064e3b'); // emerald-900
            ground.addColorStop(1, '#022c22'); // emerald-950
            ctx.fillStyle = ground;
            ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

            // Draw growing tree (foreground) if Pomodoro mode
            if (isPomodoro) {
                const cx = W / 2;
                const cy = GROUND_Y + 10;
                const growScale = 0.2 + (percentage * 1.3);

                ctx.save();
                ctx.translate(cx, cy);
                ctx.scale(growScale, growScale);

                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 15;

                // Active Trunk
                ctx.fillStyle = '#78350f';
                ctx.fillRect(-5, -40, 10, 40);

                // Active Leaves
                ctx.fillStyle = '#10b981';
                
                ctx.beginPath();
                ctx.moveTo(0, -90);
                ctx.lineTo(-30, -30);
                ctx.lineTo(30, -30);
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(0, -60);
                ctx.lineTo(-35, -10);
                ctx.lineTo(35, -10);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(0, -30);
                ctx.lineTo(-40, 10);
                ctx.lineTo(40, 10);
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.restore();

                // Draw falling leaves if running
                if (isRunning) {
                    if (Math.random() < 0.1) {
                        leavesRef.current.push({
                            x: cx + (Math.random() - 0.5) * 80 * growScale,
                            y: cy - (30 + Math.random() * 60) * growScale,
                            vx: (Math.random() - 0.5) * 1 + 0.5,
                            vy: Math.random() * 1 + 0.5,
                            size: 2 + Math.random() * 3,
                            angle: Math.random() * Math.PI * 2,
                            rotSpeed: (Math.random() - 0.5) * 0.2,
                            life: 1
                        });
                    }
                }
            }

            // Update and draw leaves
            leavesRef.current = leavesRef.current.filter(l => l.y < H && l.life > 0);
            leavesRef.current.forEach(l => {
                l.x += l.vx;
                l.y += l.vy;
                l.angle += l.rotSpeed;
                l.life -= 0.005;

                ctx.save();
                ctx.translate(l.x, l.y);
                ctx.rotate(l.angle);
                ctx.globalAlpha = Math.max(0, l.life);
                ctx.fillStyle = '#34d399';
                
                ctx.beginPath();
                ctx.ellipse(0, 0, l.size, l.size/2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            animRef.current = requestAnimationFrame(drawFrame);
        };

        animRef.current = requestAnimationFrame(drawFrame);
        return () => cancelAnimationFrame(animRef.current);
    }, [isRunning, percentage, isPomodoro]);

    return (
        <div className="w-full rounded-[2.5rem] overflow-hidden border border-white/10 relative bg-[#0f172a] shadow-2xl shadow-emerald-900/20 group">
            {/* Header */}
            <div className="absolute top-4 left-6 z-20 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-emerald-500/30">
                    <TreePine size={14} className="text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Forest Grove</span>
                </div>
            </div>

            {/* Tree Count Badge */}
            <div className="absolute top-4 right-6 z-20">
                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">🌳</span>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-100">
                        {baseTrees} Planted
                    </span>
                </div>
            </div>

            {/* Interactive Overlay for Established Trees */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden h-[200px]">
                {establishedTrees.map((tree) => (
                    <div 
                        key={tree.id}
                        className="absolute bottom-0 flex flex-col items-center pointer-events-auto cursor-help group/tree"
                        style={{ 
                            left: tree.x, 
                            bottom: tree.bottom,
                            transform: `scale(${tree.scale}) translateX(-50%)`,
                            zIndex: tree.zIndex
                        }}
                        onMouseEnter={() => setHoveredTree(tree)}
                        onMouseLeave={() => setHoveredTree(null)}
                    >
                        {/* Tree SVG */}
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            className="relative text-emerald-600 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform hover:scale-110"
                        >
                            <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="16" y="40" width="8" height="20" fill="#451a03"/>
                                <path d="M20 0L40 25H30L35 40H5L10 25H0L20 0Z" fill="currentColor" className="text-emerald-700"/>
                                <path d="M20 10L32 28H26L30 40H10L14 28H8L20 10Z" fill="currentColor" className="text-emerald-600"/>
                            </svg>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Tooltip for hovered tree */}
            <AnimatePresence>
                {hoveredTree && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        className="absolute z-30 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl shadow-black/50 pointer-events-none"
                        style={{ 
                            left: '50%', 
                            top: '50%', 
                            transform: 'translate(-50%, -50%)',
                            minWidth: '200px'
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                <TreePine size={12} />
                                Task Completed
                            </span>
                            <span className="text-white font-medium text-sm drop-shadow-md">
                                {hoveredTree.task}
                            </span>
                            <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase font-bold mt-1">
                                <CalendarDays size={10} />
                                {hoveredTree.date}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Canvas environment */}
            <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full h-[200px] object-cover"
            />

            {/* Progress area */}
            <div className="relative z-20 bg-[#020617] border-t border-white/5 px-8 py-4 flex items-center gap-6">
                {/* Progress bar */}
                <div className="flex-1">
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                        <motion.div
                            className="h-full rounded-full relative"
                            style={{
                                background: 'linear-gradient(90deg, #059669, #10b981)',
                                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                            }}
                            animate={{ width: `${percentage * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                        {/* Seed / Tree icon indicators */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#020617] rounded-full p-0.5">
                            <Sprout size={12} className="text-emerald-600" />
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-[#020617] rounded-full p-0.5">
                            <TreePine size={14} className="text-emerald-400" />
                        </div>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-emerald-700/70 font-bold uppercase tracking-widest">SEEDLING</span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{Math.round(percentage * 100)}%</span>
                        <span className="text-[10px] text-emerald-700/70 font-bold uppercase tracking-widest">TREE</span>
                    </div>
                </div>

                {/* Animated state indicator */}
                <motion.div
                    animate={{ y: isRunning ? [-2, 2, -2] : 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-4xl flex-shrink-0 filter"
                    style={{ filter: isRunning ? 'drop-shadow(0 0 12px rgba(16,185,129,0.5))' : 'none' }}
                >
                    {percentage > 0.8 ? '🌳' : percentage > 0.4 ? '🪴' : '🌱'}
                </motion.div>

                {isRunning && isPomodoro && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-shrink-0 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl"
                    >
                        <Wind size={12} className="text-emerald-400 animate-pulse" />
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Growing</span>
                    </motion.div>
                )}
                {isRunning && !isPomodoro && (
                     <motion.div
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="flex-shrink-0 flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl"
                 >
                     <Zap size={12} className="text-blue-400 animate-pulse" />
                     <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Resting</span>
                 </motion.div>
                )}
            </div>

            {/* Session Complete Screen */}
            <AnimatePresence>
                {showFinish && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className="text-7xl mb-4"
                        >
                            🌳
                        </motion.div>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-black text-emerald-400 glow drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                        >
                            Tree Planted!
                        </motion.p>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-emerald-100/70 text-sm mt-2 font-bold uppercase tracking-widest"
                        >
                            Your forest grows stronger 🌲
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ForestGrove;
