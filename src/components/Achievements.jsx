import React from 'react';
import { motion } from 'framer-motion';
import { BADGES } from '../utils/achievements';
import { Lock } from 'lucide-react';

const Achievements = ({ stats }) => {
    return (
        <div className="glass p-6 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand/10 rounded-xl">
                    <Lock size={18} className="text-brand" />
                </div>
                <h3 className="font-black text-base">Achievements & Badges</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {BADGES.map((badge) => {
                    const isUnlocked = stats ? badge.check(stats) : false;
                    const Icon = badge.icon;

                    return (
                        <motion.div
                            key={badge.id}
                            whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                            className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-2
                                ${isUnlocked 
                                    ? 'bg-white/5 border-white/10 shadow-lg' 
                                    : 'bg-black/20 border-white/5 opacity-40 grayscale'
                                }`}
                        >
                            {!isUnlocked && (
                                <div className="absolute top-2 right-2 opacity-50">
                                    <Lock size={12} />
                                </div>
                            )}
                            
                            <div className={`p-3 rounded-xl ${isUnlocked ? badge.bg : 'bg-white/5'}`}>
                                <Icon size={24} className={isUnlocked ? badge.color : 'text-text-muted'} />
                            </div>

                            <div>
                                <h4 className={`text-[11px] font-black uppercase tracking-wider mb-0.5 ${isUnlocked ? 'text-white' : 'text-text-muted'}`}>
                                    {badge.name}
                                </h4>
                                <p className="text-[9px] text-text-muted leading-tight font-medium">
                                    {badge.description}
                                </p>
                            </div>

                            {isUnlocked && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0f172a]"
                                >
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Achievements;
