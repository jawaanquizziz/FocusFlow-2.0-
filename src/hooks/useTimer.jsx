import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { auth, db } from '../services/firebase';
import { doc, setDoc, increment, arrayUnion } from 'firebase/firestore';

import { MODES, DEFAULT_SETTINGS } from '../constants/timer';


const logSession = (durationSeconds, mode, taskName = null) => {
  const session = {
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-CA'),
    duration: durationSeconds,
    mode,
    task: taskName
  };

  const existing = JSON.parse(localStorage.getItem('focusSessions') || '[]');
  existing.push(session);
  if (existing.length > 100) existing.shift();
  localStorage.setItem('focusSessions', JSON.stringify(existing));

  const user = auth.currentUser;
  if (user && db && (mode === MODES.POMODORO || mode === MODES.STOPWATCH)) {
    try {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        totalFocusTime: increment(durationSeconds),
        treesPlanted: increment(1),
        sessionsCount: increment(1),
        sessions: arrayUnion(session),
        lastActive: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } catch (_) {}
  }
};

export const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('timerSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('timerState');
    if (saved) return JSON.parse(saved).mode;
    return MODES.POMODORO;
  });

  const [activeMode, setActiveMode] = useState(() => {
    const saved = localStorage.getItem('timerState');
    if (saved) return JSON.parse(saved).activeMode || JSON.parse(saved).mode;
    return MODES.POMODORO;
  });

  const [timers, setTimers] = useState(() => {
    const saved = localStorage.getItem('timerState');
    if (saved) {
      const state = JSON.parse(saved);
      const savedTimers = state.timers || {
        [MODES.POMODORO]: settings[MODES.POMODORO],
        [MODES.SHORT_BREAK]: settings[MODES.SHORT_BREAK],
        [MODES.LONG_BREAK]: settings[MODES.LONG_BREAK],
        [MODES.STOPWATCH]: 0
      };
      
      if (state.isRunning) {
        const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
        const aMode = state.activeMode || state.mode;
        if (aMode === MODES.STOPWATCH) {
          savedTimers[aMode] += elapsed;
        } else {
          // Calculate new time but don't let it be 0 if we want it to reset on next load
          const remaining = (state.timers ? state.timers[aMode] : state.timeLeft) - elapsed;
          savedTimers[aMode] = Math.max(0, remaining);
        }
        return savedTimers;
      }

      // If NOT running, ensure any 0 timers (except stopwatch) are reset to defaults
      Object.keys(DEFAULT_SETTINGS).forEach(m => {
        if (m !== MODES.STOPWATCH && (savedTimers[m] <= 0 || !savedTimers[m])) {
            savedTimers[m] = settings[m];
        }
      });
      return savedTimers;
    }
    return {
      [MODES.POMODORO]: settings[MODES.POMODORO],
      [MODES.SHORT_BREAK]: settings[MODES.SHORT_BREAK],
      [MODES.LONG_BREAK]: settings[MODES.LONG_BREAK],
      [MODES.STOPWATCH]: 0
    };
  });

  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('timerState');
    if (saved) {
      const state = JSON.parse(saved);
      if (state.isRunning) {
        const aMode = state.activeMode || state.mode;
        const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
        const savedTime = state.timers ? state.timers[aMode] : state.timeLeft;
        
        if (aMode === MODES.STOPWATCH) return true;
        return (savedTime - elapsed) > 0;
      }
    }
    return false;
  });

  const [totalFocusSeconds, setTotalFocusSeconds] = useState(() =>
    parseInt(localStorage.getItem('focusSeconds') || '0')
  );
  
  const currentTaskRef = useRef((() => {
    const saved = localStorage.getItem('timerState');
    try {
        return saved ? JSON.parse(saved).currentTask : null;
    } catch (e) { return null; }
  })());

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const isRunningRef = useRef(isRunning);
  const autoStartRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('timerSettings', JSON.stringify(settings));
  }, [settings]);


  useEffect(() => {
    localStorage.setItem('focusSeconds', totalFocusSeconds.toString());
  }, [totalFocusSeconds]);

  useEffect(() => {
    localStorage.setItem('timerState', JSON.stringify({
      mode,
      activeMode,
      timers,
      isRunning,
      lastUpdated: Date.now(),
      currentTask: currentTaskRef.current
    }));
  }, [mode, activeMode, timers, isRunning]);

  const switchMode = useCallback((newMode, forceAutoStart = false) => {
    setMode(newMode);
    
    if (forceAutoStart) {
        setIsRunning(false);
        isRunningRef.current = false;
        clearInterval(intervalRef.current);
        
        setActiveMode(newMode);
        setTimers(prev => ({ ...prev, [newMode]: settings[newMode] }));
        
        autoStartRef.current = true;
    }
  }, [settings]);

  const startTimer = useCallback((taskName = null) => {
    setIsRunning(true);
    isRunningRef.current = true;
    setActiveMode(mode);
    
    if (taskName && typeof taskName === 'string') {
        currentTaskRef.current = taskName;
    }
    
    startTimeRef.current = Date.now();
    const initialTime = timers[mode];

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      let newTime;
      
      if (mode === MODES.STOPWATCH) {
        newTime = initialTime + elapsed;
        setTotalFocusSeconds(prev => prev + 1);
      } else {
        newTime = Math.max(0, initialTime - elapsed);
        if (mode === MODES.POMODORO) {
          setTotalFocusSeconds(prev => prev + 1);
        }
      }

      setTimers(prev => ({ ...prev, [mode]: newTime }));

      if (mode !== MODES.STOPWATCH && newTime === 0) {
        setIsRunning(false);
        isRunningRef.current = false;
        clearInterval(intervalRef.current);

        const sessionDuration = settings[mode];
        const completedTask = currentTaskRef.current;
        logSession(sessionDuration, mode, completedTask);
        currentTaskRef.current = null;

        if (mode === MODES.POMODORO && completedTask) {
            try {
                const savedTodos = localStorage.getItem('todos');
                if (savedTodos) {
                    const todos = JSON.parse(savedTodos);
                    const updatedTodos = todos.map(t => 
                        t.text === completedTask ? { ...t, done: true } : t
                    );
                    localStorage.setItem('todos', JSON.stringify(updatedTodos));
                    window.dispatchEvent(new Event('todosUpdated'));
                }
            } catch (e) {}
        }

        const alarm = new Audio('/audio/end_time_pomodoro.mp3');
        alarm.play().catch(() => {});
        
        if (mode === MODES.POMODORO) {
          switchMode(MODES.SHORT_BREAK, true);
        } else {
          switchMode(MODES.POMODORO, true);
        }
      }
    }, 1000);
  }, [mode, timers, settings, switchMode]);

  const stopTimer = useCallback(() => {
    if (activeMode === mode) {
      setIsRunning(false);
      isRunningRef.current = false;
      clearInterval(intervalRef.current);
    } else {
      setIsRunning(false);
      isRunningRef.current = false;
      clearInterval(intervalRef.current);
    }
  }, [activeMode, mode]);

  const resetTimer = useCallback(() => {
    if (activeMode === MODES.STOPWATCH && timers[activeMode] > 0) {
      logSession(timers[activeMode], MODES.STOPWATCH, currentTaskRef.current);
    }
    
    stopTimer();
    setTimers(prev => ({ ...prev, [mode]: settings[mode] }));
    currentTaskRef.current = null;
  }, [activeMode, mode, timers, settings, stopTimer]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    if (!isRunning || activeMode !== mode) {
      setTimers(prev => ({ ...prev, [mode]: newSettings[mode] }));
    }
  }, [isRunning, activeMode, mode]);

  useEffect(() => {
    if (isRunning && !intervalRef.current) {
        startTimer(currentTaskRef.current);
    }
  }, []);

  useEffect(() => {
    if (autoStartRef.current && timers[mode] === settings[mode]) {
        autoStartRef.current = false;
        startTimer(currentTaskRef.current);
    }
  }, [mode, timers, settings, startTimer]);

  const timeLeft = timers[mode];
  const isViewRunning = isRunning && activeMode === mode;

  const value = {
    mode, timeLeft, isRunning: isViewRunning, totalFocusSeconds,
    switchMode, startTimer, stopTimer, resetTimer,
    settings, updateSettings, MODES,
    currentTask: currentTaskRef.current
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
