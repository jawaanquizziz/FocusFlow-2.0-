import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db } from '../services/firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

const MODES = {
  POMODORO: 'pomodoro',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
  STOPWATCH: 'stopwatch'
};

const DEFAULT_SETTINGS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  stopwatch: 0
};

// Log a completed focus session to localStorage and Firestore
const logSession = (durationSeconds, mode) => {
  const session = {
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
    duration: durationSeconds,
    mode,
  };

  // Save to localStorage for local progress charts
  const existing = JSON.parse(localStorage.getItem('focusSessions') || '[]');
  existing.push(session);
  if (existing.length > 100) existing.shift(); // keep last 100
  localStorage.setItem('focusSessions', JSON.stringify(existing));

  // Write to Firestore if logged in
  const user = auth.currentUser;
  if (user && db && mode === MODES.POMODORO) {
    try {
      updateDoc(doc(db, 'users', user.uid), {
        totalFocusTime: increment(durationSeconds),
        sessions: arrayUnion(session),
      }).catch(() => {}); // silent fail - not critical
    } catch (_) {}
  }
};

export const useTimer = () => {
  const [mode, setMode] = useState(MODES.POMODORO);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('timerSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  
  const [timeLeft, setTimeLeft] = useState(settings[MODES.POMODORO]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(() =>
    parseInt(localStorage.getItem('focusSeconds') || '0')
  );

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const sessionStartSecondsRef = useRef(0); // track seconds at session start

  useEffect(() => {
    localStorage.setItem('timerSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('focusSeconds', totalFocusSeconds.toString());
  }, [totalFocusSeconds]);

  const switchMode = useCallback((newMode) => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setMode(newMode);
    setTimeLeft(settings[newMode]);
    pausedTimeRef.current = 0;
  }, [settings]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
    const initialTime = pausedTimeRef.current || timeLeft;
    sessionStartSecondsRef.current = totalFocusSeconds;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      if (mode === MODES.STOPWATCH) {
        const newTime = initialTime + elapsed;
        setTimeLeft(newTime);
        setTotalFocusSeconds(prev => prev + 1);
      } else {
        const newTime = Math.max(0, initialTime - elapsed);
        setTimeLeft(newTime);
        
        if (mode === MODES.POMODORO) {
          setTotalFocusSeconds(prev => prev + 1);
        }

        if (newTime === 0) {
          setIsRunning(false);
          clearInterval(intervalRef.current);

          // Log completed session
          const sessionDuration = settings[mode];
          logSession(sessionDuration, mode);

          const alarm = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-typewriter-soft-keys-1110.mp3');
          alarm.play().catch(() => {});
          
          if (mode === MODES.POMODORO) {
            switchMode(MODES.SHORT_BREAK);
          } else {
            switchMode(MODES.POMODORO);
          }
        }
      }
    }, 1000);
  }, [mode, timeLeft, switchMode, settings, totalFocusSeconds]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    pausedTimeRef.current = timeLeft;
  }, [timeLeft]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(settings[mode]);
    pausedTimeRef.current = 0;
  }, [mode, settings, stopTimer]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    if (!isRunning) {
      setTimeLeft(newSettings[mode]);
    }
  }, [isRunning, mode]);

  return {
    mode, timeLeft, isRunning, totalFocusSeconds,
    switchMode, startTimer, stopTimer, resetTimer,
    settings, updateSettings, MODES
  };
};
