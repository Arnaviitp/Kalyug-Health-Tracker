import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, History, Zap, Target, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FOCUS_QUOTES = [
  "Focus on the process, not the outcome.",
  "Your attention is your greatest asset.",
  "Deep work is the superpower of the 21st century.",
  "One task at a time. One breath at a time.",
  "Silence the noise, amplify the signal.",
  "Energy flows where attention goes."
];

const FOCUS_MODES = [
  { id: 'deep-work', label: 'Deep Work', icon: <Zap size={14} />, color: '#6366f1' },
  { id: 'learning', label: 'Learning', icon: <Target size={14} />, color: '#10b981' },
  { id: 'meditation', label: 'Zen', icon: <Zap size={14} />, color: '#f59e0b' },
  { id: 'coding', label: 'Coding', icon: <Zap size={14} />, color: '#8b5cf6' },
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
  const [sessionGoal, setSessionGoal] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(true);
  const [selectedFocusMode, setSelectedFocusMode] = useState('deep-work');

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
        const currentModeData = FOCUS_MODES.find(m => m.id === selectedFocusMode);
        const newSession = {
          id: Date.now(),
          type: 'Pomodoro',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: Math.floor(totalTime / 60),
          goal: sessionGoal,
          focusMode: currentModeData?.label || 'Deep Work',
          intensity: Math.floor(Math.random() * 20) + 80 // Simulated intensity for now
        };
        const updatedHistory = [newSession, ...history].slice(0, 10);
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
  }, [isActive, timeLeft, soundEnabled, mode, history, setIsActive, setTimeLeft, setHistory, sessionGoal, selectedFocusMode, totalTime]);

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

  const handleStart = () => {
    setIsActive(true);
    setIsEditingGoal(false);
  };

  return (
    <div className="focus-timer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div className="timer-modes" style={{ 
        display: 'flex', 
        gap: '4px', 
        background: 'rgba(0,0,0,0.05)', 
        padding: '4px', 
        borderRadius: '24px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%'
      }}>
        {['pomodoro', 'shortBreak', 'longBreak'].map(m => (
          <button 
            key={m}
            className={`mode-btn ${mode === m ? 'active' : ''}`} 
            onClick={() => changeMode(m)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
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

      {mode === 'pomodoro' && !isActive && (
        <div className="focus-mode-selector" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {FOCUS_MODES.map(fm => (
            <button
              key={fm.id}
              onClick={() => setSelectedFocusMode(fm.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: selectedFocusMode === fm.id ? `1px solid ${fm.color}` : '1px solid var(--glass-border)',
                background: selectedFocusMode === fm.id ? `${fm.color}15` : 'transparent',
                color: selectedFocusMode === fm.id ? fm.color : 'var(--text-secondary)',
                fontSize: '0.7rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {fm.icon} {fm.label}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {isEditingGoal && mode === 'pomodoro' ? (
          <motion.div 
            key="goal-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ width: '100%', marginBottom: '24px' }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type="text" 
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                placeholder="What are you achieving now?"
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  paddingLeft: '38px',
                  borderRadius: '14px', 
                  border: '1px solid var(--glass-border)', 
                  background: 'rgba(var(--bg-primary-rgb), 0.3)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Target size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
            </div>
          </motion.div>
        ) : mode === 'pomodoro' ? (
          <motion.div 
            key="goal-display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => !isActive && setIsEditingGoal(true)}
            style={{ marginBottom: '24px', textAlign: 'center', cursor: isActive ? 'default' : 'pointer' }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Target Locked</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              {sessionGoal || "Pure Focus"}
              {!isActive && <Edit3 size={14} opacity={0.5} />}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      <div className="timer-visual-container" style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '40px' }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle 
            cx="50" cy="50" r="46" 
            fill="transparent" 
            stroke="var(--glass-border)" 
            strokeWidth="3" 
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
              fontSize: '3rem', 
              fontWeight: '900', 
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-2px',
              color: 'var(--text-primary)'
            }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </motion.div>
          <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.4, marginTop: '-4px' }}>
            {isActive ? 'Coherence' : 'Stasis'}
          </div>
        </div>
      </div>
      
      <div className="timer-controls" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => isActive ? setIsActive(false) : handleStart()}
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
            onClick={() => { setIsActive(false); setTimeLeft(totalTime); setIsEditingGoal(true); }}
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
            <span>Neural Archive</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence initial={false}>
              {history.map((session) => (
                <motion.div 
                  key={session.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'rgba(var(--bg-primary-rgb), 0.2)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={12} style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>{session.focusMode || 'Focus'}</span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: '4px', fontWeight: '900' }}>{session.duration}M</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{session.goal || "Pure Focus Session"}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{session.timestamp}</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${session.intensity || 90}%`, background: 'var(--accent-primary)', height: '100%' }} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

