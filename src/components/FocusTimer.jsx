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

export default function FocusTimer({
  timeLeft,
  setTimeLeft,
  isActive,
  setIsActive,
  mode,
  setMode,
  soundEnabled,
  setSoundEnabled,
  history,
  setHistory
}) {
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
      
      if (mode === 'pomodoro') {
        const newSession = {
          id: Date.now(),
          type: 'Pomodoro',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: 25
        };
        const updatedHistory = [newSession, ...history].slice(0, 3);
        setHistory(updatedHistory);
        localStorage.setItem('k-focus-history', JSON.stringify(updatedHistory));
      }

      if (soundEnabled) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch(e) {}
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, soundEnabled, mode, history, setIsActive, setTimeLeft, setHistory]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'pomodoro') setTimeLeft(25 * 60);
    else if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  return (
    <div className="focus-timer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="timer-modes" style={{ 
        display: 'flex', 
        gap: '8px', 
        background: 'rgba(0,0,0,0.05)', 
        padding: '6px', 
        borderRadius: '100px', 
        marginBottom: '40px' 
      }}>
        {['pomodoro', 'shortBreak', 'longBreak'].map(m => (
          <button 
            key={m}
            className={`mode-btn ${mode === m ? 'active' : ''}`} 
            onClick={() => changeMode(m)}
            style={{
              padding: '8px 16px',
              borderRadius: '100px',
              border: 'none',
              background: mode === m ? 'var(--bg-secondary)' : 'transparent',
              color: mode === m ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: mode === m ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {m === 'pomodoro' ? 'Pomodoro' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>
      
      <div className="timer-visual-container" style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '40px' }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle 
            cx="50" cy="50" r="46" 
            fill="transparent" 
            stroke="var(--glass-border)" 
            strokeWidth="4" 
          />
          <motion.circle 
            cx="50" cy="50" r="46" 
            fill="transparent" 
            stroke="var(--accent-primary)" 
            strokeWidth="4" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            style={{ filter: 'drop-shadow(0 0 8px var(--accent-glow))' }}
          />
        </svg>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              fontSize: '3.5rem', 
              fontWeight: '800', 
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-2px',
              color: 'var(--text-primary)'
            }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </motion.div>
          <div style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.4, marginTop: '-8px' }}>
            {isActive ? 'Flowing' : 'Paused'}
          </div>
        </div>
      </div>
      
      <div className="timer-controls" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsActive(!isActive)}
          style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'var(--accent-primary)', 
            color: 'white', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px var(--accent-glow)'
          }}
        >
          {isActive ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" style={{ marginLeft: '4px' }} />}
        </motion.button>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setIsActive(false); setTimeLeft(totalTime); }}
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--glass-bg)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <RotateCcw size={18} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--glass-bg)', color: soundEnabled ? 'var(--accent-primary)' : 'var(--text-secondary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </motion.button>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ width: '100%', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <History size={14} />
            <span>Chamber History</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <AnimatePresence initial={false}>
              {history.map((session) => (
                <motion.div 
                  key={session.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{session.type}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{session.timestamp}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

