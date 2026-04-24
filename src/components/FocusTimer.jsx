import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, History, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FOCUS_QUOTES = [
  "Focus on the process, not the outcome.",
  "Your attention is your greatest asset.",
  "Deep work is the superpower of the 21st century.",
  "One task at a time. One breath at a time.",
  "Silence the noise, amplify the signal.",
  "Energy flows where attention goes."
];

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // pomodoro, shortBreak, longBreak
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('k-focus-history');
    return saved ? JSON.parse(saved) : [];
  });

  const totalTime = useMemo(() => {
    if (mode === 'pomodoro') return 25 * 60;
    if (mode === 'shortBreak') return 5 * 60;
    return 15 * 60;
  }, [mode]);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      
      // Record session
      if (mode === 'pomodoro') {
        const newSession = {
          id: Date.now(),
          type: 'Pomodoro',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: 25
        };
        const updatedHistory = [newSession, ...history].slice(0, 5);
        setHistory(updatedHistory);
        localStorage.setItem('k-focus-history', JSON.stringify(updatedHistory));
      }

      if (soundEnabled) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      }
      
      let blinks = 0;
      const blinkInterval = setInterval(() => {
        document.title = blinks % 2 === 0 ? "🔔 TIME'S UP!" : "HabitArc";
        blinks++;
        if (blinks > 10) {
          clearInterval(blinkInterval);
          document.title = "HabitArc";
        }
      }, 500);
    }

    if (isActive) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      document.title = `(${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}) Focus`;
    } else {
      document.title = "HabitArc";
    }

    return () => {
      clearInterval(interval);
      document.title = "HabitArc";
    };
  }, [isActive, timeLeft, soundEnabled, mode, history]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'pomodoro') setTimeLeft(25 * 60);
    else if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="focus-timer">
      <div className="timer-modes">
        <button className={`mode-btn ${mode === 'pomodoro' ? 'active' : ''}`} onClick={() => changeMode('pomodoro')}>Pomodoro</button>
        <button className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`} onClick={() => changeMode('shortBreak')}>Break</button>
        <button className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`} onClick={() => changeMode('longBreak')}>Long</button>
      </div>
      
      <div className="timer-visual-container">
        <svg className="timer-svg" viewBox="0 0 100 100">
          <circle className="timer-bg" cx="50" cy="50" r="45" />
          <motion.circle 
            className="timer-progress" 
            cx="50" cy="50" r="45" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        </svg>
        <div className={`timer-display ${isActive ? 'active' : ''}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
      
      <div className="timer-controls">
        <button className="control-btn play-pause" onClick={toggleTimer} aria-label={isActive ? "Pause" : "Start"}>
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button className="control-btn restart" onClick={resetTimer} aria-label="Reset Timer">
          <RotateCcw size={20} />
        </button>
        <button className="control-btn sound" onClick={() => setSoundEnabled(!soundEnabled)} aria-label={soundEnabled ? "Disable Sound" : "Enable Sound"}>
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {history.length > 0 && (
        <div className="focus-history">
          <div className="history-header">
            <History size={14} />
            <span>Recent Sessions</span>
          </div>
          <div className="history-list">
            <AnimatePresence initial={false}>
              {history.map((session) => (
                <motion.div 
                  key={session.id} 
                  className="history-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <Zap size={12} style={{ color: 'var(--accent-primary)' }} />
                  <span className="history-time">{session.timestamp}</span>
                  <span className="history-type">{session.type}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
