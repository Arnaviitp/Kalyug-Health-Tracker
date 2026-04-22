import { Check, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const TactileLog = ({ habits, toggleHabit, addHabit, deleteHabit, moveHabit }) => {
  const [newHabit, setNewHabit] = useState('');

  const handleToggle = (habit) => {
    // If we're completing it, fire confetti
    if (!habit.completed) {
      fireConfetti();
    }
    toggleHabit(habit.id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    addHabit(newHabit);
    setNewHabit('');
  };

  const fireConfetti = () => {
    // Generate organic pop sound with zero external assets
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch(err) {
      console.log('Audio not supported or permitted');
    }

    const end = Date.now() + 1000;
    const colors = ['#3b82f6', '#22c55e', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  return (
    <div className="habit-list">
      <AnimatePresence>
        {habits.map((habit, index) => (
          <motion.div 
            key={habit.id} 
            className="habit-item-container"
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className={`tactile-btn ${habit.completed ? 'success' : ''}`}
              onClick={() => handleToggle(habit)}
              aria-label={`Toggle habit ${habit.text}`}
            >
              <span>{habit.text}</span>
              <div className="checkbox-circle">
                {habit.completed && <Check size={16} strokeWidth={3} />}
              </div>
            </button>
            
            <div className="habit-controls">
              <div className="reorder-btns">
                <button className="icon-btn" onClick={() => moveHabit(index, 'up')} disabled={index === 0}>
                  <ChevronUp size={16} />
                </button>
                <button className="icon-btn" onClick={() => moveHabit(index, 'down')} disabled={index === habits.length - 1}>
                  <ChevronDown size={16} />
                </button>
              </div>
              <button 
                className="icon-btn delete-btn" 
                onClick={() => deleteHabit(habit.id)}
                aria-label={`Delete ${habit.text}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Add Habit Field */}
      <form onSubmit={handleAdd} className="add-habit-container">
        <input 
          type="text" 
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Craft a new habit..." 
          className="add-habit-input"
        />
        <button type="submit" className="add-habit-btn">
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
};

export default TactileLog;
