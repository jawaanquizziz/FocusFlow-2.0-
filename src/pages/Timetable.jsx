import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Timetable = () => {
  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('timetableData');
    return saved ? JSON.parse(saved) : {};
  });

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [task, setTask] = useState('');

  useEffect(() => {
    localStorage.setItem('timetableData', JSON.stringify(timetable));
  }, [timetable]);

  const addEntry = () => {
    if (!date || !startTime || !endTime || !task) return;
    
    const newTimetable = { ...timetable };
    if (!newTimetable[date]) newTimetable[date] = [];
    
    newTimetable[date].push({
      id: Date.now(),
      startTime,
      endTime,
      task
    });
    
    setTimetable(newTimetable);
    setTask('');
  };

  const deleteEntry = (dt, id) => {
    const newTimetable = { ...timetable };
    newTimetable[dt] = newTimetable[dt].filter(e => e.id !== id);
    if (newTimetable[dt].length === 0) delete newTimetable[dt];
    setTimetable(newTimetable);
  };

  const sortedDates = Object.keys(timetable).sort();

  return (
    <div className="min-h-screen bg-bg-dark p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold font-brand">Timetable <span className="text-brand">Planner</span></h1>
        </div>
      </header>

      <section className="glass p-6 sm:p-8 rounded-3xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#2C2F33] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Start Time</label>
            <input 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-[#2C2F33] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">End Time</label>
            <input 
              type="time" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-[#2C2F33] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Task</label>
            <input 
              type="text" 
              placeholder="Study Math..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-[#2C2F33] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand/40"
            />
          </div>
        </div>

        <button 
          onClick={addEntry}
          className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-xl transition-all shadow-[0_8px_25px_rgba(88,101,242,0.3)] flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add To Schedule
        </button>
      </section>

      <section className="space-y-6">
        <AnimatePresence>
          {sortedDates.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center">
              <Calendar size={48} className="mx-auto text-text-muted/30 mb-4" />
              <p className="text-text-muted italic">Your schedule is clear. Add some tasks!</p>
            </div>
          ) : (
            sortedDates.map((dt) => (
              <motion.div 
                key={dt}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-3xl overflow-hidden border border-white/5"
              >
                <h3 className="text-brand font-bold mb-4 flex items-center gap-3">
                  <span className="w-2 h-2 bg-brand rounded-full" />
                  {new Date(dt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                
                <div className="space-y-3">
                  {timetable[dt].map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/[0.08] transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="text-text-muted flex flex-col">
                          <span className="text-xs uppercase tracking-widest opacity-60">Time</span>
                          <span className="text-sm font-bold text-white">{entry.startTime} - {entry.endTime}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-xs uppercase tracking-widest opacity-60 text-text-muted">Task</span>
                          <span className="font-semibold">{entry.task}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => deleteEntry(dt, entry.id)}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default Timetable;
