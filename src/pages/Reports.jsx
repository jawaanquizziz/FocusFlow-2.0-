import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, BarChart2, Calendar, Clock, TreePine, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className={`p-5 rounded-3xl border border-white/5 flex flex-col gap-3 ${bg} print:border-black/20 print:bg-transparent print:p-2`}>
        <div className={`p-2.5 bg-white/10 rounded-xl w-fit print:hidden`}><Icon size={18} className={color} /></div>
        <p className="text-text-muted text-[10px] uppercase tracking-widest font-black print:text-black/60">{label}</p>
        <h3 className={`text-2xl font-black ${color} print:text-black`}>{value}</h3>
    </div>
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

    const totalHours = (totalFocusSeconds / 3600).toFixed(1);
    const pomodoroSessions = sessions.filter(s => s.mode === 'pomodoro');
    const treesPlanted = pomodoroSessions.length; // Assuming 1 tree per pomodoro session for local data
    
    // Group sessions by date for the chart/table
    const sessionsByDate = pomodoroSessions.reduce((acc, session) => {
        const date = session.date;
        if (!acc[date]) acc[date] = { count: 0, duration: 0 };
        acc[date].count += 1;
        acc[date].duration += session.duration;
        return acc;
    }, {});

    const sortedDates = Object.keys(sessionsByDate).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6 bg-[#0f172a] print:bg-white print:text-black">
            {/* Header */}
            <header className="glass p-6 rounded-[2rem] flex items-center gap-4 print:hidden">
                <Link to="/profile" className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white">
                    <ArrowLeft size={22} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black font-brand">My <span className="text-brand">Reports</span></h1>
                    <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Productivity Data</p>
                </div>
                <button 
                    onClick={handlePrint}
                    className="ml-auto p-3 rounded-2xl bg-brand/10 text-brand hover:bg-brand/20 transition-all flex items-center gap-2"
                    title="Print Report">
                    <Printer size={18} />
                    <span className="hidden sm:inline font-bold text-sm">Save as PDF</span>
                </button>
            </header>

            {/* Print Header (Only visible when printing) */}
            <div className="hidden print:block mb-8 border-b pb-4">
                <h1 className="text-3xl font-black">FocusFlow Productivity Report</h1>
                <p className="text-sm text-gray-500 mt-2">Generated on {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">User: {user?.displayName || user?.email || 'Anonymous'}</p>
            </div>

            {/* Summary Stats */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 print:border-none print:p-0 print:shadow-none">
                <div className="flex items-center gap-3 mb-6 print:mb-4">
                    <div className="p-2.5 bg-brand/10 rounded-xl print:hidden"><BarChart2 size={18} className="text-brand" /></div>
                    <h2 className="text-xl font-black print:text-2xl print:text-black">Summary Overview</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                    <StatCard icon={Clock} label="Total Focus Time" value={`${totalHours}h`} color="text-brand" bg="bg-brand/5" />
                    <StatCard icon={TreePine} label="Trees Planted" value={treesPlanted} color="text-emerald-400" bg="bg-emerald-400/5" />
                    <StatCard icon={Zap} label="Completed Sessions" value={pomodoroSessions.length} color="text-yellow-400" bg="bg-yellow-400/5" />
                    <StatCard icon={Calendar} label="Active Days" value={sortedDates.length} color="text-purple-400" bg="bg-purple-400/5" />
                </div>
            </div>

            {/* Detailed Activity Log */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 print:border-none print:p-0 print:shadow-none print:mt-8">
                <div className="flex items-center gap-3 mb-6 print:mb-4">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl print:hidden"><Calendar size={18} className="text-emerald-400" /></div>
                    <h2 className="text-xl font-black print:text-2xl print:text-black">Daily Activity Breakdown</h2>
                </div>

                {sortedDates.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">
                        <p className="text-sm font-bold uppercase tracking-widest">No data available</p>
                        <p className="text-xs mt-2 opacity-60">Complete some focus sessions to see your daily breakdown.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 print:border-black/20 text-text-muted print:text-black/60 text-xs uppercase tracking-wider">
                                    <th className="pb-4 font-bold">Date</th>
                                    <th className="pb-4 font-bold">Sessions</th>
                                    <th className="pb-4 font-bold">Focus Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 print:divide-black/10">
                                {sortedDates.map(date => {
                                    const data = sessionsByDate[date];
                                    const dateObj = new Date(date);
                                    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
                                    const minutes = Math.round(data.duration / 60);
                                    
                                    return (
                                        <tr key={date} className="hover:bg-white/5 transition-colors print:hover:bg-transparent text-sm">
                                            <td className="py-4 font-medium text-white print:text-black">{formattedDate}</td>
                                            <td className="py-4 text-emerald-400 print:text-black">{data.count} trees 🌳</td>
                                            <td className="py-4 text-brand print:text-black font-mono">{minutes} min</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Tasks List */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 print:border-none print:p-0 print:shadow-none print:mt-8 break-inside-avoid">
                <div className="flex items-center gap-3 mb-6 print:mb-4">
                    <div className="p-2.5 bg-yellow-500/10 rounded-xl print:hidden"><Zap size={18} className="text-yellow-400" /></div>
                    <h2 className="text-xl font-black print:text-2xl print:text-black">Recent Tasks Log</h2>
                </div>

                {pomodoroSessions.length === 0 ? (
                    <div className="text-center py-8 text-text-muted">
                        <p className="text-xs font-bold uppercase tracking-widest">No tasks logged</p>
                    </div>
                ) : (
                    <div className="space-y-2 print:space-y-1">
                        {pomodoroSessions.slice().reverse().slice(0, 20).map((s, i) => {
                            const d = new Date(s.timestamp);
                            return (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl print:bg-transparent print:border-b print:border-black/10 print:rounded-none">
                                    <div>
                                        <p className="text-sm font-bold text-white print:text-black">{s.task || 'Uncategorized Session'}</p>
                                        <p className="text-xs text-text-muted print:text-gray-500">
                                            {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <span className="text-brand font-mono text-xs print:text-black">
                                        {Math.round(s.duration / 60)}m
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <style jsx global>{`
                @media print {
                    @page { margin: 1.5cm; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                    .glass { background: transparent !important; box-shadow: none !important; backdrop-filter: none !important; }
                    .text-white { color: black !important; }
                    .text-text-muted { color: #4b5563 !important; }
                    .text-brand, .text-emerald-400, .text-yellow-400, .text-purple-400 { color: black !important; }
                }
            `}</style>
        </div>
    );
};

export default Reports;
