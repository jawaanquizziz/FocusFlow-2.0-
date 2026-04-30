import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Zap, Target, Calendar, Flame, Download, X, TreePine } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const COLORS = ['#5865F2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
        <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">{label || payload[0].name}</p>
        <p className="text-lg font-black text-brand">
            {payload[0].value}{payload[0].unit === 'sessions' ? ' sessions' : 'h'}
        </p>
      </div>
    );
  }
  return null;
};

const Progress = () => {
  const { user } = useAuth();
  const [showReport, setShowReport] = useState(false);

  const [sessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('focusSessions') || '[]'); } catch { return []; }
  });

  const [totalFocusSeconds] = useState(() => parseInt(localStorage.getItem('focusSeconds') || '0'));

  const [todos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('focusflow_todos') || '[]'); } catch { return []; }
  });

  // Weekly bar chart data
  const weeklyData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const daySessions = sessions.filter(s => s.date === dateStr && s.mode === 'pomodoro');
      const hours = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600;
      days.push({ day: dayLabel, hours: parseFloat(hours.toFixed(2)), date: dateStr });
    }
    return days;
  })();

  // Cumulative hours over last 7 days for area chart
  const cumulativeData = weeklyData.reduce((acc, day, i) => {
    const prev = acc[i - 1]?.total || 0;
    acc.push({ ...day, total: parseFloat((prev + day.hours).toFixed(2)) });
    return acc;
  }, []);

  // Task distribution for Pie Chart
  const pieData = (() => {
      const distribution = sessions
          .filter(s => s.mode === 'pomodoro' && s.task)
          .reduce((acc, s) => {
              acc[s.task] = (acc[s.task] || 0) + 1;
              return acc;
          }, {});
      
      const data = Object.entries(distribution)
          .map(([name, value]) => ({ name, value, unit: 'sessions' }))
          .sort((a, b) => b.value - a.value);
      
      if (data.length === 0) return [{ name: 'No tasks tracked', value: 1, unit: 'sessions' }];
      return data.slice(0, 5); // top 5
  })();

  // Stats
  const totalHours = (totalFocusSeconds / 3600).toFixed(1);
  const todaySec = sessions.filter(s => s.date === new Date().toLocaleDateString('en-CA') && s.mode === 'pomodoro').reduce((a, s) => a + (s.duration || 0), 0);
  const todayHours = (todaySec / 3600).toFixed(1);
  const completedTodos = todos.filter(t => t.completed).length;
  const treesPlanted = user?.treesPlanted || sessions.filter(s => s.mode === 'pomodoro').length;

  const streak = (() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const hasSessions = sessions.some(s => s.date === dateStr && s.mode === 'pomodoro');
      if (hasSessions) count++;
      else if (i > 0) break;
    }
    return count;
  })();

  const recentSessions = [...sessions].filter(s => s.mode === 'pomodoro').reverse().slice(0, 8);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const handlePrint = () => {
      window.print();
  };

  return (
    <>
      <style>{`
        @media print {
            body * { visibility: hidden; }
            #report-content, #report-content * { visibility: visible; }
            #report-content { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
            .no-print { display: none !important; }
            .glass { background: white !important; color: black !important; border: 1px solid #ccc !important; box-shadow: none !important; }
            .text-white { color: black !important; }
            .text-text-muted { color: #666 !important; }
        }
      `}</style>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <motion.header variants={item} className="glass p-6 rounded-[2rem] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white">
                <ArrowLeft size={22} />
              </Link>
              <div>
                <h1 className="text-2xl font-black font-brand">
                  Progress <span className="text-brand">Dashboard</span>
                </h1>
                <p className="text-text-muted text-xs uppercase tracking-widest font-bold">
                  {user?.displayName ? `${user.displayName}'s stats` : 'Your focus analytics'}
                </p>
              </div>
          </div>
          <button onClick={() => setShowReport(true)} className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-2xl font-black hover:bg-brand/80 transition-all shadow-lg shadow-brand/20">
              <Download size={18} />
              <span className="hidden sm:inline">Generate Report</span>
          </button>
        </motion.header>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Focus', value: `${totalHours}h`, icon: TrendingUp, color: 'text-brand', bg: 'bg-brand/10' },
            { label: "Today's Focus", value: `${todayHours}h`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { label: 'Day Streak', value: `${streak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
            { label: 'Trees Planted', value: treesPlanted, icon: TreePine, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ scale: 1.02 }} className="glass p-5 rounded-3xl border border-white/5">
              <div className={`p-2.5 ${stat.bg} rounded-xl w-fit mb-3`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-text-muted text-[10px] uppercase tracking-widest font-black mb-1">{stat.label}</p>
              <h2 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h2>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weekly Bar Chart (Span 2) */}
          <motion.div variants={item} className="glass p-6 rounded-3xl border border-white/5 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-brand/10 rounded-xl"><Calendar size={18} className="text-brand" /></div>
              <div>
                <h3 className="font-black text-base">Weekly Focus</h3>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Hours per day</p>
              </div>
            </div>
            <div className="h-52">
              {weeklyData.every(d => d.hours === 0) ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                  <Flame size={28} className="text-brand/30" />
                  <p className="text-text-muted text-xs font-bold uppercase tracking-widest">No sessions yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barSize={28}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#B9BBBE', fontSize: 11, fontWeight: 700 }} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(88,101,242,0.05)', radius: 8 }} />
                    <Bar dataKey="hours" fill="url(#barGradient)" radius={[8, 8, 0, 0]}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5865F2" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#5865F2" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Task Distribution Pie Chart */}
          <motion.div variants={item} className="glass p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-orange-400/10 rounded-xl"><Target size={18} className="text-orange-400" /></div>
              <div>
                <h3 className="font-black text-base">Task Focus</h3>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Top activities</p>
              </div>
            </div>
            <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
                {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        {entry.name.length > 10 ? entry.name.substring(0, 10) + '...' : entry.name}
                    </div>
                ))}
            </div>
          </motion.div>
        </div>

      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
          {showReport && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
                  <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative my-auto">
                      
                      <div className="absolute top-6 right-6 flex items-center gap-3 no-print">
                          <button onClick={handlePrint} className="bg-brand text-white px-5 py-2.5 rounded-2xl font-black hover:bg-brand/80 transition-all flex items-center gap-2">
                              <Download size={18} /> Print PDF
                          </button>
                          <button onClick={() => setShowReport(false)} className="p-2.5 bg-white/5 text-text-muted hover:text-white rounded-xl transition-all">
                              <X size={20} />
                          </button>
                      </div>

                      {/* Content that gets printed */}
                      <div id="report-content" className="p-8 sm:p-12">
                          <div className="text-center mb-10">
                              <h1 className="text-4xl font-black font-brand mb-2">FocusFlow Productivity Report</h1>
                              <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Generated for {user?.displayName || 'User'} · {new Date().toLocaleDateString()}</p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                              {[
                                  { label: 'Total Hours Focused', value: totalHours, color: 'text-brand' },
                                  { label: 'Trees Planted', value: treesPlanted, color: 'text-emerald-400' },
                                  { label: 'Current Streak', value: `${streak} Days`, color: 'text-orange-400' },
                                  { label: 'Completed Tasks', value: completedTodos, color: 'text-green-400' },
                              ].map(stat => (
                                  <div key={stat.label} className="glass p-6 rounded-3xl text-center">
                                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">{stat.label}</p>
                                      <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                                  </div>
                              ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                              <div className="glass p-8 rounded-3xl">
                                  <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Calendar size={20}/> Weekly Trend</h3>
                                  <div className="h-64">
                                      <ResponsiveContainer width="100%" height="100%">
                                          <AreaChart data={cumulativeData}>
                                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12, fontWeight: 700 }} />
                                              <YAxis hide />
                                              <Tooltip content={<CustomTooltip />} />
                                              <Area type="monotone" dataKey="total" stroke="#5865F2" strokeWidth={3} fill="#5865F2" fillOpacity={0.2} dot={{ fill: '#5865F2', r: 4 }} />
                                          </AreaChart>
                                      </ResponsiveContainer>
                                  </div>
                              </div>

                              <div className="glass p-8 rounded-3xl">
                                  <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Target size={20}/> Task Distribution</h3>
                                  <div className="h-64">
                                      <ResponsiveContainer width="100%" height="100%">
                                          <PieChart>
                                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none" label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                                                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                              </Pie>
                                              <Tooltip content={<CustomTooltip />} />
                                          </PieChart>
                                      </ResponsiveContainer>
                                  </div>
                              </div>
                          </div>
                          
                          <p className="text-center text-xs font-bold text-slate-600 uppercase tracking-widest mt-10">
                              Generated by FocusFlow Premium • focusflow.app
                          </p>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </>
  );
};

export default Progress;
