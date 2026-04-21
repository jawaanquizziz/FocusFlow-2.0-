import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Flag, ChevronUp } from 'lucide-react';

const CAR_EMOJIS = ['🏎️', '🚗', '🚙', '🚕'];

const RacingTrack = ({ progress, isRunning, mode }) => {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const roadOffsetRef = useRef(0);
    const particlesRef = useRef([]);
    const [position, setPosition] = useState(4);
    const [showFinish, setShowFinish] = useState(false);

    const percentage = Math.min(Math.max(progress || 0, 0), 1);

    // Opponent simulated progresses (they race independently)
    const opponentProgress = [
        Math.min(1, percentage * 0.82 + 0.05),
        Math.min(1, percentage * 1.1),
        Math.min(1, percentage * 0.67 + 0.1),
    ];

    // Calculate player position (rank)
    useEffect(() => {
        const playerPos = opponentProgress.filter(op => op > percentage).length + 1;
        setPosition(playerPos);
    }, [percentage]);

    // Show finish animation
    useEffect(() => {
        if (percentage >= 1 && !showFinish) {
            setShowFinish(true);
            setTimeout(() => setShowFinish(false), 3000);
        }
    }, [percentage]);

    // Canvas animation for perspective road
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        const HORIZON_Y = H * 0.38;
        const ROAD_W_BOTTOM = W * 0.85;
        const ROAD_W_TOP = W * 0.08;

        // Speed: fast when running, slow when paused
        const speed = isRunning ? 6 : 0.5;

        const drawFrame = () => {
            ctx.clearRect(0, 0, W, H);

            // Sky gradient
            const sky = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
            sky.addColorStop(0, '#050510');
            sky.addColorStop(1, '#0D0E22');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, W, HORIZON_Y);

            // Stars in sky
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            for (let i = 0; i < 40; i++) {
                const sx = (i * 71 + 13) % W;
                const sy = (i * 37 + 5) % HORIZON_Y;
                ctx.fillRect(sx, sy, 1.2, 1.2);
            }

            // Road (trapezoid)
            const roadGrad = ctx.createLinearGradient(0, HORIZON_Y, 0, H);
            roadGrad.addColorStop(0, '#1a1a2e');
            roadGrad.addColorStop(1, '#0f0f1f');
            ctx.beginPath();
            ctx.moveTo(W / 2 - ROAD_W_TOP / 2, HORIZON_Y);
            ctx.lineTo(W / 2 + ROAD_W_TOP / 2, HORIZON_Y);
            ctx.lineTo(W / 2 + ROAD_W_BOTTOM / 2, H);
            ctx.lineTo(W / 2 - ROAD_W_BOTTOM / 2, H);
            ctx.closePath();
            ctx.fillStyle = roadGrad;
            ctx.fill();

            // Road edge glow lines
            ctx.strokeStyle = 'rgba(88, 101, 242, 0.5)';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#5865F2';
            ctx.shadowBlur = 8;
            // Left edge
            ctx.beginPath();
            ctx.moveTo(W / 2 - ROAD_W_TOP / 2, HORIZON_Y);
            ctx.lineTo(W / 2 - ROAD_W_BOTTOM / 2, H);
            ctx.stroke();
            // Right edge
            ctx.beginPath();
            ctx.moveTo(W / 2 + ROAD_W_TOP / 2, HORIZON_Y);
            ctx.lineTo(W / 2 + ROAD_W_BOTTOM / 2, H);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Dashed center line (moving)
            roadOffsetRef.current = (roadOffsetRef.current + speed) % 80;
            const dashCount = 10;
            for (let i = 0; i < dashCount; i++) {
                const t = (i / dashCount + roadOffsetRef.current / 80) % 1;
                const y = HORIZON_Y + t * (H - HORIZON_Y);
                const xScale = (y - HORIZON_Y) / (H - HORIZON_Y);
                const xPos = W / 2;
                const hw = (ROAD_W_TOP / 2 + xScale * (ROAD_W_BOTTOM / 2 - ROAD_W_TOP / 2)) * 0.02;
                const lineH = 10 + xScale * 30;
                ctx.fillStyle = `rgba(255,255,255,${0.1 + xScale * 0.3})`;
                ctx.fillRect(xPos - hw, y, hw * 2, lineH);
            }

            // Lane dividers (left + right of center)
            for (let lane = -1; lane <= 1; lane += 2) {
                for (let i = 0; i < dashCount; i++) {
                    const t = (i / dashCount + roadOffsetRef.current / 80) % 1;
                    const y = HORIZON_Y + t * (H - HORIZON_Y);
                    const xScale = (y - HORIZON_Y) / (H - HORIZON_Y);
                    const roadHalf = ROAD_W_TOP / 2 + xScale * (ROAD_W_BOTTOM / 2 - ROAD_W_TOP / 2);
                    const xPos = W / 2 + lane * roadHalf * 0.5;
                    const hw = roadHalf * 0.015;
                    const lineH = 8 + xScale * 20;
                    ctx.fillStyle = `rgba(255,255,255,${0.05 + xScale * 0.15})`;
                    ctx.fillRect(xPos - hw, y, hw * 2, lineH);
                }
            }

            // Speed particles when running
            if (isRunning) {
                if (Math.random() < 0.4) {
                    particlesRef.current.push({
                        x: W / 2 + (Math.random() - 0.5) * ROAD_W_BOTTOM * 0.8,
                        y: H - 20,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -(2 + Math.random() * 4),
                        life: 1,
                        size: 1 + Math.random() * 2,
                        color: Math.random() > 0.5 ? '#5865F2' : '#FF00E5',
                    });
                }
                particlesRef.current = particlesRef.current.filter(p => p.life > 0);
                particlesRef.current.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= 0.05;
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;
                });
            }

            // Opponents on road (above player, shrinking perspective)
            opponentProgress.forEach((op, i) => {
                const t = 1 - op * 0.7; // they appear smaller as progress increases
                const yPos = HORIZON_Y + t * (H - HORIZON_Y) * 0.6;
                const scale = 0.3 + t * 0.5;
                const xOffset = [W * 0.35, W * 0.65, W * 0.5][i];
                ctx.font = `${Math.floor(18 * scale)}px serif`;
                ctx.textAlign = 'center';
                ctx.fillText(CAR_EMOJIS[i + 1], xOffset, yPos);
            });

            // Horizon glow
            const horizGlow = ctx.createLinearGradient(0, HORIZON_Y - 10, 0, HORIZON_Y + 10);
            horizGlow.addColorStop(0, 'transparent');
            horizGlow.addColorStop(0.5, 'rgba(88,101,242,0.15)');
            horizGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = horizGlow;
            ctx.fillRect(0, HORIZON_Y - 10, W, 20);

            animRef.current = requestAnimationFrame(drawFrame);
        };

        animRef.current = requestAnimationFrame(drawFrame);
        return () => cancelAnimationFrame(animRef.current);
    }, [isRunning, percentage]);

    const positionLabels = ['', '🥇 1st', '🥈 2nd', '🥉 3rd', '4th'];
    const positionColors = ['', 'text-yellow-400', 'text-slate-300', 'text-orange-400', 'text-text-muted'];

    return (
        <div className="w-full rounded-[2.5rem] overflow-hidden border border-white/10 relative bg-[#050510] shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="absolute top-4 left-6 z-10 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10">
                    <Flag size={14} className="text-brand" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Race Mode</span>
                </div>
            </div>

            {/* Position Badge */}
            <div className="absolute top-4 right-6 z-10">
                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                    <ChevronUp size={14} className="text-brand" />
                    <span className={`text-xs font-black uppercase tracking-widest ${positionColors[position]}`}>
                        {positionLabels[position] || '4th'}
                    </span>
                </div>
            </div>

            {/* Canvas road */}
            <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full h-[200px] object-cover"
            />

            {/* Player car area */}
            <div className="relative bg-[#0a0a18] border-t border-white/5 px-8 py-4 flex items-center gap-6">
                {/* Progress track */}
                <div className="flex-1">
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                        <motion.div
                            className="h-full rounded-full relative"
                            style={{
                                background: 'linear-gradient(90deg, #5865F2, #FF00E5)',
                                boxShadow: '0 0 20px rgba(88,101,242,0.6)',
                            }}
                            animate={{ width: `${percentage * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                        {/* Finish flag */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                            <Trophy size={14} className="text-yellow-400" />
                        </div>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">START</span>
                        <span className="text-[10px] text-brand font-bold uppercase tracking-widest">{Math.round(percentage * 100)}%</span>
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">FINISH</span>
                    </div>
                </div>

                {/* Your car */}
                <motion.div
                    animate={{ y: isRunning ? [0, -3, 0] : 0, scale: isRunning ? [1, 1.05, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                    className="text-4xl flex-shrink-0 filter"
                    style={{ filter: isRunning ? 'drop-shadow(0 0 12px #5865F2)' : 'none' }}
                >
                    🏎️
                </motion.div>

                {isRunning && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-shrink-0 flex items-center gap-1 bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-xl"
                    >
                        <Zap size={12} className="text-brand animate-pulse" />
                        <span className="text-xs font-black text-brand uppercase tracking-widest">Racing</span>
                    </motion.div>
                )}
            </div>

            {/* Finish Screen */}
            <AnimatePresence>
                {showFinish && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 10 }}
                            className="text-6xl mb-4"
                        >
                            🏆
                        </motion.div>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-black text-white glow"
                        >
                            Session Complete!
                        </motion.p>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-text-muted text-sm mt-2 font-bold uppercase tracking-widest"
                        >
                            You crushed it 🔥
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RacingTrack;
