import { Check, Trash2, Plus, ChevronUp, ChevronDown, Heart, Brain, Briefcase, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TactileLog = ({ habits, toggleHabit, addHabit, deleteHabit, moveHabit }) => {
  const [newHabit, setNewHabit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('work');

  const categories = [
    { id: 'physical', icon: <Heart size={14} />, color: '#10b981', label: 'Physical' },
    { id: 'mental', icon: <Brain size={14} />, color: '#6366f1', label: 'Mental' },
    { id: 'work', icon: <Briefcase size={14} />, color: '#8b5cf6', label: 'Work' },
    { id: 'soul', icon: <Sparkles size={14} />, color: '#f59e0b', label: 'Soul' },
  ];

  const handleToggle = (habit) => {
    if (!habit.completed) {
      fireConfetti();
    }
    toggleHabit(habit.id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    addHabit(newHabit, selectedCategory);
    setNewHabit('');
  };

  const fireConfetti = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch(err) {
      // Audio not supported
    }

    const end = Date.now() + 600;
    const colors = ['#6366f1', '#10b981', '#a855f7'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
        ticks: 200,
        gravity: 1.2,
        scalar: 0.8,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
        ticks: 200,
        gravity: 1.2,
        scalar: 0.8,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  return (
    <div className="habit-list">
      <AnimatePresence mode='popLayout'>
        {habits.map((habit, index) => (
          <motion.div 
            key={habit.id} 
            className="habit-item-container"
            layout
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
          >
            <button
              className={`tactile-btn ${habit.completed ? 'success' : ''}`}
              onClick={() => handleToggle(habit)}
              aria-label={`Toggle habit ${habit.text}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="habit-category-tag" style={{ 
                  color: habit.completed ? 'white' : (categories.find(c => c.id === habit.category)?.color || 'var(--text-secondary)'),
                  background: habit.completed ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px'
                }}>
                  {categories.find(c => c.id === habit.category)?.icon || <Sparkles size={16} />}
                </div>
                <span style={{ 
                  textDecoration: habit.completed ? 'line-through' : 'none',
                  opacity: habit.completed ? 0.7 : 1,
                  fontSize: '1.05rem',
                  fontWeight: 500
                }}>{habit.text}</span>
              </div>
              <div className="checkbox-circle" style={{ width: '24px', height: '24px' }}>
                {habit.completed && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <Check size={14} strokeWidth={4} />
                  </motion.div>
                )}
              </div>
            </button>
            
            <div className="habit-controls">
              <div className="reorder-btns">
                <button className="icon-btn" onClick={() => moveHabit(index, 'up')} disabled={index === 0}>
                  <ChevronUp size={14} />
                </button>
                <button className="icon-btn" onClick={() => moveHabit(index, 'down')} disabled={index === habits.length - 1}>
                  <ChevronDown size={14} />
                </button>
              </div>
              <button 
                className="icon-btn delete-btn" 
                onClick={() => deleteHabit(habit.id)}
                aria-label={`Delete ${habit.text}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <motion.div 
        className="add-habit-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '32px' }}>
          <div style={{ width: '24px', height: '1px', background: 'var(--glass-border)' }}></div>
          <h3 className="section-title" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)' }}>
            New Daily Action
          </h3>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>
        
        <form onSubmit={handleAdd} className="add-habit-form-container glass-panel" style={{ padding: '20px', background: 'rgba(var(--bg-primary-rgb), 0.3)', borderStyle: 'dashed' }}>
          <div className="category-selector-mini" style={{ marginBottom: '16px' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`cat-mini-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
                title={cat.label}
                style={{ '--cat-color': cat.color }}
              >
                {cat.icon}
              </button>
            ))}
          </div>
          <div className="add-habit-container">
            <input 
              type="text" 
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="What's your next win?" 
              className="add-habit-input"
              style={{ padding: '14px 20px', borderRadius: '16px' }}
            />
            <motion.button 
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="add-habit-btn"
              style={{ borderRadius: '16px', background: 'var(--accent-primary)', width: '54px' }}
            >
              <Plus size={24} />
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TactileLog;
