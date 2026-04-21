import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ArrowLeft, X, Plus, Clock, Tag, Calendar as CalIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { id: 'study', label: 'Study', color: '#5865F2' },
    { id: 'work', label: 'Work', color: '#10B981' },
    { id: 'exercise', label: 'Exercise', color: '#F97316' },
    { id: 'personal', label: 'Personal', color: '#EC4899' },
    { id: 'break', label: 'Break', color: '#8B5CF6' },
];

const DEFAULT_FORM = {
    task: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'study',
    notes: '',
};

const EventModal = ({ date, event, onSave, onDelete, onClose }) => {
    const isEditing = !!event;
    const [form, setForm] = useState(() => {
        if (isEditing) {
            const ep = event.extendedProps;
            return {
                task: event.title || '',
                startTime: ep?.startTime || event.start?.toTimeString().slice(0, 5) || '09:00',
                endTime: ep?.endTime || event.end?.toTimeString().slice(0, 5) || '10:00',
                category: ep?.category || 'study',
                notes: ep?.notes || '',
            };
        }
        return { ...DEFAULT_FORM };
    });

    const selectedCategory = CATEGORIES.find(c => c.id === form.category);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.task.trim()) return;
        onSave({ ...form, date: date });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="relative w-full max-w-md bg-[#0D0E12] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl z-10"
            >
                {/* Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[100px] pointer-events-none"
                    style={{ background: selectedCategory?.color + '30' }} />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl" style={{ background: selectedCategory?.color + '20' }}>
                            <CalIcon size={20} style={{ color: selectedCategory?.color }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">
                                {isEditing ? 'Edit Event' : 'Schedule Block'}
                            </h2>
                            <p className="text-text-muted text-xs font-bold uppercase tracking-widest">
                                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Task Name */}
                    <div>
                        <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-2 block ml-1">What will you do?</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={form.task}
                            onChange={e => setForm(f => ({ ...f, task: e.target.value }))}
                            placeholder="e.g. Physics Chapter 5, Deep Work, Gym..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-medium transition-all"
                            style={{ '--tw-ring-color': selectedCategory?.color + '60' }}
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-2 block ml-1 flex items-center gap-1.5">
                                <Clock size={10} /> Start
                            </label>
                            <input
                                type="time"
                                required
                                value={form.startTime}
                                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 text-sm font-bold text-white transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-2 block ml-1 flex items-center gap-1.5">
                                <Clock size={10} /> End
                            </label>
                            <input
                                type="time"
                                required
                                value={form.endTime}
                                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 text-sm font-bold text-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block ml-1 flex items-center gap-1.5">
                            <Tag size={10} /> Category
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${form.category === cat.id ? 'scale-105' : 'opacity-50 hover:opacity-80 border-white/10 bg-white/5'}`}
                                    style={form.category === cat.id ? {
                                        background: cat.color + '20',
                                        borderColor: cat.color + '60',
                                        color: cat.color,
                                    } : {}}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-2 block ml-1">Notes (optional)</label>
                        <textarea
                            rows={2}
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="Add any extra details..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 text-sm font-medium resize-none transition-all"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="px-5 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-2xl text-sm font-black transition-all"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-black transition-all flex-shrink-0"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 text-white shadow-lg active:scale-95"
                            style={{ background: selectedCategory?.color, boxShadow: `0 4px 20px ${selectedCategory?.color}40` }}
                        >
                            <CheckCircle size={16} />
                            {isEditing ? 'Save Changes' : 'Add to Schedule'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const Planner = () => {
    const [timetable, setTimetable] = useState(() => {
        const saved = localStorage.getItem('timetableData');
        return saved ? JSON.parse(saved) : {};
    });

    const [events, setEvents] = useState([]);
    const [modal, setModal] = useState(null); // { date, event? }

    // Convert timetable to FullCalendar events
    useEffect(() => {
        const calEvents = [];
        Object.entries(timetable).forEach(([date, entries]) => {
            entries.forEach(entry => {
                const cat = CATEGORIES.find(c => c.id === entry.category) || CATEGORIES[0];
                calEvents.push({
                    id: entry.id,
                    title: entry.task,
                    start: `${date}T${entry.startTime}`,
                    end: `${date}T${entry.endTime}`,
                    backgroundColor: cat.color,
                    borderColor: 'transparent',
                    extendedProps: { date, ...entry },
                });
            });
        });
        setEvents(calEvents);
    }, [timetable]);

    const saveTimetable = (updated) => {
        setTimetable(updated);
        localStorage.setItem('timetableData', JSON.stringify(updated));
    };

    const handleDateClick = (arg) => {
        setModal({ date: arg.dateStr });
    };

    const handleEventClick = (info) => {
        setModal({ date: info.event.extendedProps.date, event: info.event });
    };

    const handleSave = ({ task, startTime, endTime, category, notes, date }) => {
        const id = `${date}-${startTime}-${Date.now()}`;
        const updated = { ...timetable };
        if (!updated[date]) updated[date] = [];

        // If editing, remove old entry first
        if (modal?.event) {
            const oldDate = modal.event.extendedProps.date;
            const oldId = modal.event.id;
            updated[oldDate] = (updated[oldDate] || []).filter(e => e.id !== oldId);
            if (updated[oldDate].length === 0) delete updated[oldDate];
        }

        if (!updated[date]) updated[date] = [];
        updated[date].push({ id, task, startTime, endTime, category, notes });
        saveTimetable(updated);
        setModal(null);
    };

    const handleDelete = () => {
        if (!modal?.event) return;
        const { date, id } = modal.event.extendedProps;
        const updated = { ...timetable };
        updated[date] = (updated[date] || []).filter(e => e.id !== id);
        if (updated[date]?.length === 0) delete updated[date];
        saveTimetable(updated);
        setModal(null);
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
            <header className="glass p-5 rounded-[2rem] flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white">
                        <ArrowLeft size={22} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black font-brand">
                            Focus<span className="text-brand">Planner</span>
                        </h1>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Click any day to schedule</p>
                    </div>
                </div>
                <button
                    onClick={() => setModal({ date: new Date().toLocaleDateString('en-CA') })}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-brand/20 active:scale-95"
                >
                    <Plus size={18} />
                    Add Event
                </button>
            </header>

            <div className="glass p-6 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={events}
                    editable={false}
                    selectable={true}
                    dayMaxEvents={true}
                    weekends={true}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    height="auto"
                />
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap gap-3 justify-center">
                {CATEGORIES.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{cat.label}</span>
                    </div>
                ))}
            </div>

            {/* Event Modal */}
            <AnimatePresence>
                {modal && (
                    <EventModal
                        key="event-modal"
                        date={modal.date}
                        event={modal.event || null}
                        onSave={handleSave}
                        onDelete={handleDelete}
                        onClose={() => setModal(null)}
                    />
                )}
            </AnimatePresence>

            <style>{`
                .fc { --fc-border-color: rgba(255,255,255,0.05); --fc-button-bg-color: #5865F2; --fc-button-border-color: #5865F2; --fc-button-hover-bg-color: #4752C4; --fc-page-bg-color: transparent; color: #DCDDDE; }
                .fc-theme-standard td, .fc-theme-standard th { border: 1px solid rgba(255,255,255,0.04); }
                .fc-toolbar-title { font-family: 'Kdam Thmor Pro', sans-serif; font-size: 1.25rem !important; font-weight: 900; }
                .fc-day-today { background: rgba(88,101,242,0.07) !important; }
                .fc-event { border-radius: 8px; padding: 2px 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer; border: none !important; }
                .fc-col-header-cell { padding: 10px 0; background: rgba(255,255,255,0.02); }
                .fc-scrollgrid { border: none !important; }
                .fc-daygrid-day-number { padding: 8px !important; font-weight: 700; opacity: 0.7; cursor: pointer; }
                .fc-daygrid-day:hover { background: rgba(88,101,242,0.05); cursor: pointer; }
                .fc-button-primary:not(:disabled).fc-button-active, .fc-button-primary:not(:disabled):active { background-color: #4752C4 !important; border-color: #4752C4 !important; }
                .fc-button { border-radius: 10px !important; font-weight: 700 !important; font-size: 12px !important; }
            `}</style>
        </div>
    );
};

export default Planner;
