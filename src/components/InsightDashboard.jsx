import { Flame, Trophy, ShieldAlert, Heart, Activity, CheckCircle2, Zap, BrainCircuit, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const InsightDashboard = ({ 
  habits,
  completedCount, 
  totalCount, 
  streaks, 
  chartData, 
  isRecoveryMode, 
  setIsRecoveryMode,
  isProtected,
  toggleBreakGlass,
  productivityScore,
  aiProphecy,
  moods,
  todayStr,
  timerHistory = []
}) => {
  const progressPercent = totalCount === 0 ? 0 : completedCount / totalCount;
  const totalFocusMinutes = timerHistory.reduce((acc, s) => acc + (s.duration || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const categories = [
    { id: 'physical', label: 'Vitality', color: '#10b981', icon: <Heart size={12} /> },
    { id: 'mental', label: 'Intellect', color: '#6366f1', icon: <BrainCircuit size={12} /> },
    { id: 'work', label: 'Discipline', color: '#8b5cf6', icon: <TrendingUp size={12} /> },
    { id: 'soul', label: 'Zen', color: '#f59e0b', icon: <Zap size={12} /> },
  ];

  const categoryStats = categories.map(cat => {
    const catHabits = habits.filter(h => h.category === cat.id);
    const total = catHabits.length;
    const completed = catHabits.filter(h => h.completed).length;
    return { ...cat, score: total === 0 ? 0 : (completed / total) * 100 };
  });

  return (
    <motion.div 
      className="insight-dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      {/* Target Progress Ring */}
      <div className="progress-ring-container">
        <div className="progress-ring" style={{ width: '160px', height: '160px' }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
            </defs>
            <circle 
              className="progress-ring-circle-bg" 
              cx="80" cy="80" r="70" 
              strokeWidth="12"
            />
            <motion.circle 
              className="progress-ring-circle"
              cx="80" cy="80" r="70" 
              fill="transparent"
              stroke="url(#ring-gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progressPercent }}
              transition={{ duration: 2, ease: "circOut" }}
              style={{ filter: 'drop-shadow(0 0 8px var(--accent-glow))' }}
            />
          </svg>
          <div className="progress-ring-text">
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              key={progressPercent}
              style={{ fontSize: '2.5rem', fontWeight: '900', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {Math.round(progressPercent * 100)}%
            </motion.h2>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>COHERENCE</p>
          </div>
        </div>
        {isProtected && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="streak-protected-badge" 
            style={{ 
              marginTop: '16px', 
              fontSize: '0.75rem', 
              fontWeight: '700',
              color: 'var(--mercy-text)',
              background: 'var(--mercy-bg)',
              padding: '6px 16px',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(234, 88, 12, 0.2)'
            }}
          >
            <ShieldAlert size={14} /> STREAK SHIELD ACTIVE
          </motion.div>
        )}
      </div>

      {/* Streak Architecture */}
      <div className="streak-flex" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
        <motion.div variants={itemVariants} className="insight-stat-card glass-panel" style={{ padding: '16px', borderRadius: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(var(--bg-primary-rgb), 0.3)' }}>
          <div className="stat-icon-wrapper" style={{ color: '#f97316' }}><Flame size={20} /></div>
          <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '800' }}>{streaks.currentStreak}</span>
          <span className="stat-label" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>Current Streak</span>
        </motion.div>
        
        <motion.div variants={itemVariants} className="insight-stat-card glass-panel" style={{ padding: '16px', borderRadius: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(var(--bg-primary-rgb), 0.3)' }}>
          <div className="stat-icon-wrapper" style={{ color: '#eab308' }}><Trophy size={20} /></div>
          <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '800' }}>{streaks.longestStreak}</span>
          <span className="stat-label" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>Best Streak</span>
        </motion.div>

        <motion.div variants={itemVariants} className="insight-stat-card glass-panel" style={{ padding: '16px', borderRadius: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--accent-glow)', borderColor: 'var(--accent-primary)' }}>
          <div className="stat-icon-wrapper" style={{ color: 'var(--accent-primary)' }}><Clock size={20} /></div>
          <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{totalFocusMinutes}m</span>
          <span className="stat-label" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-primary)' }}>Focus Time</span>
        </motion.div>
      </div>

      {/* Neural Prophecy Card */}
      <motion.div variants={itemVariants} className="prophecy-card glass-panel" style={{ padding: '24px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))', border: '1px solid var(--accent-glow)' }}>
        <div className="prophecy-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--accent-primary)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
          <BrainCircuit size={18} />
          <span>Neural Insights</span>
        </div>
        <p className="prophecy-text" style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)', fontWeight: '400' }}>
          {aiProphecy || "Analyzing your neural trajectories... Maintain consistency to generate advanced predictions."}
        </p>
      </motion.div>

      {/* Weekly Activity Bar Chart */}
      <motion.div variants={itemVariants} className="activity-section">
        <h3 className="section-title" style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <Activity size={16} /> Velocity
        </h3>
        <div className="bar-chart" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', gap: '12px', padding: '0 8px' }}>
          {chartData.map((data, i) => {
             const heightPct = data.val === 0 ? '6px' : `${Math.min(data.val * 20, 100)}%`;
             return (
               <div className="bar-col" key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <motion.div 
                    className="bar" 
                    initial={{ height: 0 }}
                    animate={{ height: heightPct }}
                    transition={{ delay: 0.3 + i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                    style={{ 
                      width: '100%', 
                      background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))',
                      borderRadius: '6px 6px 4px 4px',
                      opacity: data.val === 0 ? 0.2 : 1,
                      boxShadow: data.val > 0 ? '0 4px 12px var(--accent-glow)' : 'none'
                    }}
                  />
                  <div className="bar-label" style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)' }}>{data.label}</div>
               </div>
             )
          })}
        </div>
      </motion.div>

      {/* Balance Visualizer */}
      <motion.div variants={itemVariants} className="balance-section">
        <h3 className="section-title" style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Equilibrium</h3>
        <div className="balance-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categoryStats.map(cat => (
            <div key={cat.id} className="balance-item">
              <div className="balance-label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: cat.color }}>{cat.icon}</span> {cat.label}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{Math.round(cat.score)}%</span>
              </div>
              <div className="balance-bar-bg" style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <motion.div 
                  className="balance-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.score}%` }}
                  style={{ backgroundColor: cat.color, height: '100%', borderRadius: '10px', boxShadow: `0 0 10px ${cat.color}44` }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mood Trend */}
      <motion.div variants={itemVariants} className="mood-trend-section">
        <h3 className="section-title" style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Neural Resonance (Mood)</h3>
        <div className="mood-grid" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
          {chartData.map((data, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const mood = moods[dateStr];
            const moodMap = {
              great: { emoji: '🔥', color: 'var(--accent-primary)' },
              good: { emoji: '😊', color: 'var(--success-color)' },
              neutral: { emoji: '😐', color: 'var(--text-secondary)' },
              low: { emoji: '😔', color: '#ef4444' }
            };
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: mood ? 'rgba(var(--bg-primary-rgb), 0.5)' : 'rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  border: mood ? `1px solid ${moodMap[mood].color}` : '1px solid transparent',
                  boxShadow: mood ? `0 0 10px ${moodMap[mood].color}33` : 'none'
                }}>
                  {mood ? moodMap[mood].emoji : '·'}
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-secondary)' }}>{data.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Mercy System */}
      <motion.div variants={itemVariants} className="mercy-system glass-panel" style={{ padding: '24px', background: 'rgba(var(--bg-primary-rgb), 0.2)', borderStyle: 'dashed' }}>
        <div className="mercy-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 className="section-title" style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-primary)' }}>Mercy Protocols</h3>
          {isProtected && <CheckCircle2 size={16} style={{ color: 'var(--success-color)' }} />}
        </div>
        <p className="mercy-description" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Initiate emergency protocols to safeguard your momentum during high-friction cycles.
        </p>
        
        <div className="mercy-actions" style={{ display: 'flex', gap: '12px' }}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`mercy-btn skip ${isProtected ? 'active' : ''}`}
            onClick={toggleBreakGlass}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '12px', 
              background: isProtected ? 'var(--mercy-text)' : 'var(--mercy-bg)', 
              color: isProtected ? 'white' : 'var(--mercy-text)',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={16} />
            {isProtected ? 'Shield Active' : 'Deploy Shield'}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`mercy-btn recover ${isRecoveryMode ? 'active' : ''}`}
            onClick={() => setIsRecoveryMode(!isRecoveryMode)}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '12px', 
              background: isRecoveryMode ? 'var(--recovery-text)' : 'var(--recovery-bg)', 
              color: isRecoveryMode ? 'white' : 'var(--recovery-text)',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Heart size={16} />
            {isRecoveryMode ? 'Recovery ON' : 'Recovery'}
          </motion.button>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default InsightDashboard;
