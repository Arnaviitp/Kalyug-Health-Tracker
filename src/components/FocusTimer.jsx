import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
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
  const [zenMode, setZenMode] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (soundEnabled) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      }
      
      let blinks = 0;
      const blinkInterval = setInterval(() => {
        document.title = blinks % 2 === 0 ? "🔔 TIME'S UP!" : "Kalyug Health Tracker";
        blinks++;
        if (blinks > 10) {
          clearInterval(blinkInterval);
          document.title = "Kalyug Health Tracker";
        }
      }, 500);
    }

    if (isActive) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      document.title = `(${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}) Focus`;
      
      // Update quote every 5 minutes
      if (timeLeft % 300 === 0) {
        setQuoteIndex(prev => (prev + 1) % FOCUS_QUOTES.length);
      }
    } else {
      document.title = "Kalyug Health Tracker";
    }

    return () => {
      clearInterval(interval);
      document.title = "Kalyug Health Tracker";
    };
  }, [isActive, timeLeft, soundEnabled]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
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

  const timerControls = (isZen) => (
    <>
      {!isZen && (
        <div className="timer-modes">
          <button className={`mode-btn ${mode === 'pomodoro' ? 'active' : ''}`} onClick={() => changeMode('pomodoro')}>Pomodoro</button>
          <button className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`} onClick={() => changeMode('shortBreak')}>Break</button>
        </div>
      )}
      
      <div className={`timer-display ${isActive ? 'active' : ''} ${isZen ? 'zen' : ''}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      {isZen && (
        <motion.p 
          className="zen-quote"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={quoteIndex}
        >
          {FOCUS_QUOTES[quoteIndex]}
        </motion.p>
      )}

      <div className="timer-controls">
        <button className="control-btn play-pause" onClick={toggleTimer}>
          {isActive ? <Pause size={isZen ? 32 : 24} /> : <Play size={isZen ? 32 : 24} />}
        </button>
        <button className="control-btn restart" onClick={resetTimer}>
          <RotateCcw size={isZen ? 28 : 20} />
        </button>
        <button className="control-btn sound" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 size={isZen ? 28 : 20} /> : <VolumeX size={isZen ? 28 : 20} />}
        </button>
      </div>

      <button className={`zen-mode-btn ${isZen ? 'exit' : ''}`} onClick={() => setZenMode(!zenMode)}>
        {isZen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        {isZen ? 'Exit Focus State' : 'Zen Focus'}
      </button>
    </>
  );

  return (
    <div className="focus-timer">
      {timerControls(false)}

      {mounted && createPortal(
        <AnimatePresence>
          {zenMode && (
            <motion.div 
              className="zen-mode-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="zen-bg-glow"></div>
              <div className="zen-content">
                {timerControls(true)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
