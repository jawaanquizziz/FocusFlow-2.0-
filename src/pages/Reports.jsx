import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Printer, BarChart2, Calendar, Clock, TreePine, Zap, Target, Activity, TrendingUp, Award, Rocket } from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
    PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { useAuth } from '../hooks/useAuth';

const COLORS = ['#5865F2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-[#1a1a2e] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md"
            >
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{label || payload[0].name}</p>
                <p className="text-sm font-black text-brand">
                    {payload[0].value}{payload[0].unit === 'sessions' ? ' sessions' : ' min'}
                </p>
            </motion.div>
        );
    }
    return null;
};

const StatCard = ({ icon: Icon, label, value, color, bg, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className={`p-6 rounded-[2rem] border border-white/5 flex flex-col gap-4 ${bg} relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default`}
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />
        <div className={`p-3 bg-white/10 rounded-2xl w-fit relative z-10 group-hover:scale-110 transition-transform`}><Icon size={20} className={color} /></div>
        <div className="relative z-10">
            <p className="text-text-muted text-[10px] uppercase tracking-widest font-black mb-1">{label}</p>
            <h3 className={`text-3xl font-black ${color} tracking-tight`}>{value}</h3>
        </div>
    </motion.div>
);

const Reports = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);

    useEffect(() => {
        try {
            const savedSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
            setSessions(savedSessions);
            setTotalFocusSeconds(parseInt(localStorage.getItem('focusSeconds') || '0'));
        } catch (e) {
            console.error("Failed to load sessions for report", e);
        }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const formatFocusTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const totalHours = (totalFocusSeconds / 3600).toFixed(1);
    const pomodoroSessions = sessions.filter(s => s.mode === 'pomodoro');
    const treesPlanted = pomodoroSessions.length; 
    
    // 1. Weekly Data for Trend Chart
    const weeklyTrendData = (() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-CA');
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            const daySessions = sessions.filter(s => s.date === dateStr && s.mode === 'pomodoro');
            const minutes = Math.round(daySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60);
            days.push({ name: dayLabel, minutes });
        }
        return days;
    })();

    // 2. Task Distribution for Pie Chart
    const taskDistribution = (() => {
        const dist = pomodoroSessions.reduce((acc, s) => {
            const task = s.task || 'Uncategorized';
            acc[task] = (acc[task] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(dist)
            .map(([name, value]) => ({ name, value, unit: 'sessions' }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    })();

    // 3. Radar Chart Data (Focus Profile)
    const focusProfile = [
        { subject: 'Consistency', A: Math.min(100, (pomodoroSessions.length / 10) * 100), fullMark: 100 },
        { subject: 'Intensity', A: Math.min(100, (totalFocusSeconds / 36000) * 100), fullMark: 100 },
        { subject: 'Diversity', A: Math.min(100, (Object.keys(taskDistribution).length / 5) * 100), fullMark: 100 },
        { subject: 'Stamina', A: pomodoroSessions.length > 0 ? Math.min(100, (pomodoroSessions[0].duration / 1500) * 100) : 0, fullMark: 100 },
        { subject: 'Growth', A: Math.min(100, (treesPlanted / 50) * 100), fullMark: 100 },
    ];

    const sessionsByDate = pomodoroSessions.reduce((acc, session) => {
        const date = session.date;
        if (!acc[date]) acc[date] = { count: 0, duration: 0 };
        acc[date].count += 1;
        acc[date].duration += session.duration;
        return acc;
    }, {});

    const sortedDates = Object.keys(sessionsByDate).sort((a, b) => new Date(b) - new Date(a));

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8 bg-[#0f172a] selection:bg-brand/30">
            {/* Header */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-[2.5rem] flex items-center justify-between gap-4 border border-white/10"
            >
                <div className="flex items-center gap-6">
                    <Link to="/" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-text-muted hover:text-white border border-white/5">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black font-brand tracking-tighter">
                            Performance <span className="text-brand">Hub</span>
                        </h1>
                        <p className="text-text-muted text-[10px] uppercase tracking-[0.3em] font-black opacity-60">Advanced Insights & Analytics</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handlePrint}
                        className="p-4 rounded-2xl bg-brand/10 text-brand hover:bg-brand/20 transition-all flex items-center gap-3 border border-brand/20 group"
                        title="Export Report">
                        <Printer size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline font-black text-sm uppercase tracking-widest">Export PDF</span>
                    </button>
                </div>
            </motion.header>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-12 gap-8"
            >
                {/* Main Stats Column */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Summary Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <StatCard icon={Clock} label="Focus Hours" value={`${totalHours}h`} color="text-brand" bg="bg-brand/5" delay={0.1} />
                        <StatCard icon={TreePine} label="Forest Size" value={treesPlanted} color="text-emerald-400" bg="bg-emerald-400/5" delay={0.2} />
                        <StatCard icon={Zap} label="Total Sessions" value={pomodoroSessions.length} color="text-yellow-400" bg="bg-yellow-400/5" delay={0.3} />
                        <StatCard icon={Calendar} label="Active Days" value={sortedDates.length} color="text-purple-400" bg="bg-purple-400/5" delay={0.4} />
                    </div>

                    {/* Main Trend Chart */}
                    <motion.div 
                        variants={itemVariants}
                        className="glass p-10 rounded-[3rem] border border-white/10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp size={120} className="text-brand" /></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black mb-1">Weekly Pulse</h2>
                                <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Your focus intensity over time</p>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-white tracking-widest">Live Updates</span>
                            </div>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyTrendData}>
                                    <defs>
                                        <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--brand-color)" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="var(--brand-color)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="minutes" 
                                        stroke="var(--brand-color)" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorMinutes)" 
                                        animationDuration={2000}
                                        animationEasing="ease-in-out"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Bottom Grid for Secondary Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Task Distribution */}
                        <div className="glass p-8 rounded-[2.5rem] border border-white/10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-orange-400/10 rounded-2xl text-orange-400"><Target size={22} /></div>
                                <h3 className="font-black text-xl">Task Density</h3>
                            </div>
                            <div className="h-64 flex items-center justify-center">
                                {taskDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={taskDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={90}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                                animationDuration={1500}
                                            >
                                                {taskDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center">
                                        <div className="p-4 bg-white/5 rounded-full mb-4 mx-auto w-fit"><Target className="opacity-20" size={32} /></div>
                                        <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">No task data recorded</p>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {taskDistribution.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{entry.name}</span>
                                        <span className="text-[10px] font-bold text-text-muted ml-auto">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Consistency Meter */}
                        <div className="glass p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center text-center group">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-8"><Award size={24} /></div>
                            <h3 className="font-black text-xl mb-2">Consistency Score</h3>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-8">Weekly Goal Achievement</p>
                            
                            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.03)" strokeWidth="16" fill="transparent" />
                                    <motion.circle 
                                        cx="96" cy="96" r="88" 
                                        stroke="var(--brand-color)" 
                                        strokeWidth={16} 
                                        fill="transparent" 
                                        strokeDasharray={553} 
                                        initial={{ strokeDashoffset: 553 }}
                                        animate={{ strokeDashoffset: 553 - (553 * Math.min(100, (sortedDates.length / 7) * 100)) / 100 }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-black tracking-tighter">{Math.round(Math.min(100, (sortedDates.length / 7) * 100))}%</span>
                                    <span className="text-[9px] font-black uppercase text-text-muted tracking-widest mt-1">Goal Status</span>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-brand/10 rounded-2xl border border-brand/20 w-full">
                                <p className="text-xs font-bold text-white leading-relaxed">
                                    You're on a <span className="text-brand font-black">{sortedDates.length} day streak</span>. Just {Math.max(0, 7 - sortedDates.length)} more days to a perfect week!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Focus Profile Radar */}
                    <div className="glass p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center">
                        <div className="w-full flex items-center gap-4 mb-8">
                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><Activity size={22} /></div>
                            <h3 className="font-black text-xl">Focus Archetype</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={focusProfile}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                                    <Radar 
                                        name="Focus" 
                                        dataKey="A" 
                                        stroke="var(--brand-color)" 
                                        fill="var(--brand-color)" 
                                        fillOpacity={0.5} 
                                        animationDuration={2000}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 p-5 bg-white/5 rounded-2xl border border-white/5 w-full">
                            <div className="flex items-center gap-3 mb-2">
                                <Rocket size={16} className="text-brand" />
                                <span className="text-xs font-black uppercase tracking-widest text-white">Elite Performer</span>
                            </div>
                            <p className="text-[10px] text-text-muted font-bold leading-relaxed">
                                Your stamina and intensity are significantly above average. Focus on diversity to broaden your skills.
                            </p>
                        </div>
                    </div>

                    {/* Daily Breakdown List */}
                    <div className="glass p-8 rounded-[2.5rem] border border-white/10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><Calendar size={22} /></div>
                            <h3 className="font-black text-xl">Daily Log</h3>
                        </div>

                        {sortedDates.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">No activity yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                {sortedDates.map(date => {
                                    const data = sessionsByDate[date];
                                    const dateObj = new Date(date);
                                    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                    
                                    return (
                                        <motion.div 
                                            key={date} 
                                            whileHover={{ x: 5 }}
                                            className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group transition-all hover:bg-white/10"
                                        >
                                            <div>
                                                <p className="text-xs font-black text-white mb-1 uppercase tracking-tighter">{formattedDate}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                                        <TreePine size={10} /> {data.count} Trees
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-brand font-mono">{Math.round(data.duration / 60)}m</p>
                                                <p className="text-[8px] font-black uppercase text-text-muted mt-1">Focus Time</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--brand-color); }
                
                @media print {
                    .min-h-screen { background: white !important; padding: 0 !important; color: black !important; }
                    .glass { border: 1px solid #eee !important; background: white !important; box-shadow: none !important; }
                    header, .col-span-12, .lg:col-span-8, .lg:col-span-4 { color: black !important; }
                    button, .Link, .p-3.bg-white\/5 { display: none !important; }
                    .text-white, .text-brand, .text-text-muted { color: black !important; }
                }
            `}</style>
        </div>
    );
};

export default Reports;
