import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, ListTodo } from 'lucide-react';

const TodoList = () => {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), done: false }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] flex flex-col h-full bg-white/[0.02] border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
        <ListTodo size={120} />
      </div>

      <header className="flex justify-between items-center mb-8 relative z-10">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Tasks
            </h2>
            <p className="text-text-muted text-xs uppercase tracking-widest mt-1 font-semibold">Priority Board</p>
        </div>
        <span className="bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold border border-brand/20">
            {todos.filter(t => !t.done).length} Active
        </span>
      </header>
      
      <div className="flex gap-3 mb-8 relative z-10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="New focus objective..."
          className="flex-1 bg-white/5 rounded-2xl px-5 py-4 focus:outline-none border border-white/5 focus:border-brand/40 focus:bg-white/[0.08] transition-all text-sm placeholder:text-text-muted/50"
        />
        <button
          onClick={addTodo}
          className="bg-brand hover:bg-brand-hover p-4 rounded-2xl transition-all shadow-[0_8px_20px_rgba(88,101,242,0.3)] active:scale-95"
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 min-h-[250px]">
        <AnimatePresence initial={false}>
          {todos.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
            >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                    <ListTodo className="text-text-muted/30" />
                </div>
                <p className="text-text-muted text-sm font-medium">Your priority board is clear.</p>
                <p className="text-text-muted/50 text-[10px] uppercase tracking-widest mt-2">Ready for deep work</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 10, opacity: 0 }}
                  className={`flex items-center gap-4 group p-4 rounded-2xl border transition-all ${
                    todo.done ? 'bg-white/[0.01] border-transparent' : 'bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]'
                  }`}
                >
                  <button 
                    onClick={() => toggleTodo(todo.id)}
                    className={`transition-all duration-300 ${todo.done ? 'text-brand scale-110' : 'text-text-muted group-hover:text-white'}`}
                  >
                    {todo.done ? <CheckCircle size={22} className="fill-brand/10" /> : <Circle size={22} />}
                  </button>
                  
                  <span className={`flex-1 transition-all duration-500 text-sm font-medium ${todo.done ? 'line-through text-text-muted opacity-50' : 'text-[#DCDDDE]'}`}>
                    {todo.text}
                  </span>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TodoList;
