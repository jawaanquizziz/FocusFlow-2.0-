import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Zap, Target, Calendar, Flame } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, Area, AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
        <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-brand">{payload[0].value.toFixed(1)}h</p>
      </div>
    );
  }
  return null;
};

const Progress = () => {
  const { user } = useAuth();

  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('focusSessions') || '[]');
    } catch { return []; }
  });

  const [totalFocusSeconds] = useState(() =>
    parseInt(localStorage.getItem('focusSeconds') || '0')
  );

  const [todos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('focusflow_todos') || '[]');
    } catch { return []; }
  });

  // Build last-7-days bar chart data from real sessions
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

  // Stats
  const totalHours = (totalFocusSeconds / 3600).toFixed(1);
  const todaySec = sessions
    .filter(s => s.date === new Date().toLocaleDateString('en-CA') && s.mode === 'pomodoro')
    .reduce((a, s) => a + (s.duration || 0), 0);
  const todayHours = (todaySec / 3600).toFixed(1);
  const completedTodos = todos.filter(t => t.completed).length;

  // Streak: consecutive days with sessions
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

  // Recent sessions list
  const recentSessions = [...sessions]
    .filter(s => s.mode === 'pomodoro')
    .reverse()
    .slice(0, 8);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6"
    >
      {/* Header */}
      <motion.header variants={item} className="glass p-6 rounded-[2rem] flex items-center gap-4">
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
      </motion.header>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Focus', value: `${totalHours}h`, icon: TrendingUp, color: 'text-brand', bg: 'bg-brand/10' },
          { label: "Today's Focus", value: `${todayHours}h`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Day Streak', value: `${streak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: 'Tasks Done', value: completedTodos, icon: Target, color: 'text-green-400', bg: 'bg-green-400/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="glass p-5 rounded-3xl border border-white/5"
          >
            <div className={`p-2.5 ${stat.bg} rounded-xl w-fit mb-3`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-text-muted text-[10px] uppercase tracking-widest font-black mb-1">{stat.label}</p>
            <h2 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h2>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <motion.div variants={item} className="glass p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-brand/10 rounded-xl">
              <Calendar size={18} className="text-brand" />
            </div>
            <div>
              <h3 className="font-black text-base">Weekly Focus</h3>
              <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Hours per day</p>
            </div>
          </div>
          <div className="h-52">
            {weeklyData.every(d => d.hours === 0) ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                <Flame size={28} className="text-brand/30" />
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest">No sessions yet this week</p>
                <p className="text-[10px] text-text-muted/50">Start your first Pomodoro!</p>
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

        {/* Cumulative Area Chart */}
        <motion.div variants={item} className="glass p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-green-400/10 rounded-xl">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-black text-base">Cumulative Growth</h3>
              <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Total hours over week</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#B9BBBE', fontSize: 11, fontWeight: 700 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2.5} fill="url(#areaGradient)" dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <motion.div variants={item} className="glass p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-brand/10 rounded-xl">
            <Zap size={18} className="text-brand" />
          </div>
          <h3 className="font-black text-base">Recent Sessions</h3>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest">No sessions recorded yet</p>
            <p className="text-[10px] text-text-muted/50 mt-2">Complete your first Pomodoro to see stats here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session, idx) => {
              const date = new Date(session.timestamp);
              const isToday = session.date === new Date().toLocaleDateString('en-CA');
              const mins = Math.round((session.duration || 0) / 60);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center justify-between p-4 bg-white/3 hover:bg-white/5 rounded-2xl transition-all border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
                      <Flame size={14} className="text-brand" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Focus Session</p>
                      <p className="text-[10px] text-text-muted font-medium">
                        {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="bg-brand/10 text-brand px-3 py-1 rounded-xl text-xs font-black border border-brand/20">
                    {mins} min
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Progress;
