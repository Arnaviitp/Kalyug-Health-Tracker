import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, Brain, Briefcase, Sparkles, Clock } from 'lucide-react';
import { useState } from 'react';

const RANKS = [
  "Novice", "Initiate", "Seeker", "Adept", "Sage", "Master", "Legend", "Transcendent", "Eternal"
];

const ATTRIBUTES = [
  { id: 'physical', label: 'Vitality', icon: <Heart size={14} />, color: '#4ade80' },
  { id: 'mental', label: 'Intellect', icon: <Brain size={14} />, color: '#818cf8' },
  { id: 'work', label: 'Discipline', icon: <Briefcase size={14} />, color: '#c084fc' },
  { id: 'soul', label: 'Zen', icon: <Sparkles size={14} />, color: '#fbbf24' },
  { id: 'focus', label: 'Deep Focus', icon: <Clock size={14} />, color: '#38bdf8' },
];

export default function LevelSystem({ totalXP, attributes = { physical: 0, mental: 0, work: 0, soul: 0, focus: 0 } }) {
  const [showStats, setShowStats] = useState(false);
  const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpForLevel = (level) => 50 * Math.pow(level - 1, 2);

  const currentLevel = calculateLevel(totalXP || 0);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const currentLevelXP = xpForLevel(currentLevel);
  
  const diff = nextLevelXP - currentLevelXP;
  const progressPercent = diff === 0 ? 0 : Math.max(0, Math.min(100, (((totalXP || 0) - currentLevelXP) / diff) * 100));
  
  const rankIndex = Math.min(Math.floor((currentLevel - 1) / 5), RANKS.length - 1);
  const currentRank = RANKS[rankIndex];

  return (
    <div style={{ position: 'relative' }}>
      <motion.div 
        className="level-container glass-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onMouseEnter={() => setShowStats(true)}
        onMouseLeave={() => setShowStats(false)}
        style={{ 
          padding: '12px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '18px', 
          borderRadius: '32px', 
          background: 'var(--glass-bg)', 
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          cursor: 'pointer'
        }}
      >
        <div className="level-badge" style={{ 
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          color: 'white',
          width: '48px',
          height: '48px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          fontSize: '1.1rem',
          boxShadow: '0 6px 16px var(--accent-glow)',
          transform: 'rotate(-5deg)'
        }}>
          {currentLevel}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{currentRank}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>{totalXP} <span style={{ opacity: 0.5 }}>XP</span></span>
          </div>
          <div className="xp-bar-wrapper" style={{ height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '12px', position: 'relative', width: '100%' }}>
            <motion.div 
              className="xp-bar-fill" 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: '100px',
                boxShadow: '0 0 12px var(--accent-glow)',
                position: 'relative',
                zIndex: 1
              }}
            />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '100px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}></div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="stats-popover glass-panel"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '12px',
              padding: '20px',
              zIndex: 100,
              borderRadius: '24px',
              background: 'rgba(var(--bg-primary-rgb), 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}
          >
            {ATTRIBUTES.map(attr => (
              <div key={attr.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: attr.color, display: 'flex', alignItems: 'center' }}>{attr.icon}</span> {attr.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-primary)' }}>{attributes[attr.id] || 0}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (attributes[attr.id] || 0) / 5)}%` }}
                    style={{ height: '100%', background: attr.color, borderRadius: '2px' }}
                  />
                </div>
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--glass-border)', fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: '600' }}>
              Attributes reflect your evolutionary path.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

