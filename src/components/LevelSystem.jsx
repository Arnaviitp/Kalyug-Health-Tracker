import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const RANKS = [
  "Novice", "Initiate", "Seeker", "Adept", "Sage", "Master", "Legend", "Transcendent", "Eternal"
];

export default function LevelSystem({ totalXP }) {
  const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpForLevel = (level) => 50 * Math.pow(level - 1, 2);

  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const currentLevelXP = xpForLevel(currentLevel);
  
  const progressPercent = Math.max(0, Math.min(100, ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));
  
  const rankIndex = Math.min(Math.floor((currentLevel - 1) / 5), RANKS.length - 1);
  const currentRank = RANKS[rankIndex];

  return (
    <motion.div 
      className="level-container glass-panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ 
        padding: '12px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '18px', 
        borderRadius: '32px', 
        background: 'var(--glass-bg)', 
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)'
      }}
    >
      <div className="level-badge" style={{ 
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        color: 'white',
        width: '48px',
        height: '48px',
        borderRadius: '16px',
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
        <div className="xp-bar-wrapper" style={{ height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '100px', position: 'relative', width: '100%' }}>
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
          {/* Stylish background track highlight */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '100px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}></div>
        </div>
      </div>
    </motion.div>
  );
}

