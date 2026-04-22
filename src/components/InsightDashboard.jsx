import { Flame, Trophy, ShieldAlert, Heart, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const InsightDashboard = ({ 
  completedCount, 
  totalCount, 
  streaks, 
  chartData, 
  isRecoveryMode, 
  setIsRecoveryMode,
  isProtected,
  toggleBreakGlass
}) => {
  const progressPercent = totalCount === 0 ? 0 : completedCount / totalCount;
  // 377 is the stroke-dasharray roughly 2 * pi * 60
  const offset = 377 - (377 * progressPercent);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      className="insight-dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Target Progress Ring */}
      <div className="progress-ring-container">
        <div className="progress-ring">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <circle 
              className="progress-ring-circle-bg" 
              cx="70" cy="70" r="60" 
            />
            <motion.circle 
              cx="70" cy="70" r="60" 
              fill="transparent"
              stroke="url(#ring-gradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="377"
              initial={{ strokeDashoffset: 377 }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="progress-ring-text">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={progressPercent}
            >
              {Math.round(progressPercent * 100)}%
            </motion.h2>
            <p>Today</p>
          </div>
        </div>
        {isProtected && (
          <div className="streak-protected-badge">
            <ShieldAlert size={12} /> STREAK PROTECTED
          </div>
        )}
      </div>

      {/* Streak Architecture */}
      <div className="streak-flex">
        <motion.div variants={itemVariants} className="insight-stat-card">
          <div className="stat-icon-wrapper flame"><Flame size={20} /></div>
          <div className="stat-content">
            <span className="stat-value">{streaks.currentStreak}</span>
            <span className="stat-label">Current Streak</span>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="insight-stat-card">
          <div className="stat-icon-wrapper trophy"><Trophy size={20} /></div>
          <div className="stat-content">
            <span className="stat-value">{streaks.longestStreak}</span>
            <span className="stat-label">All-time Best</span>
          </div>
        </motion.div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <motion.div variants={itemVariants} className="activity-section">
        <h3 className="section-title">
           <Activity size={16} /> Weekly Productivity
        </h3>
        <div className="bar-chart">
          {chartData.map((data, i) => {
             const heightPct = data.val === 0 ? '4px' : `${Math.min(data.val * 15, 100)}%`;
             return (
               <div className="bar-col" key={i}>
                  <motion.div 
                    className="bar" 
                    initial={{ height: 0 }}
                    animate={{ height: heightPct }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  />
                  <div className="bar-label">{data.label}</div>
               </div>
             )
          })}
        </div>
      </motion.div>

      {/* Mercy System */}
      <motion.div variants={itemVariants} className="mercy-system">
        <div className="mercy-header">
          <h3 className="section-title">Mercy Actions</h3>
          {isProtected && <CheckCircle2 size={16} className="success-icon" />}
        </div>
        <p className="mercy-description">
          Protect your streak or activate a motivational UI for difficult days.
        </p>
        
        <div className="mercy-actions">
          <button 
            className={`mercy-btn skip ${isProtected ? 'active' : ''}`}
            onClick={toggleBreakGlass}
          >
            <ShieldAlert size={18} />
            {isProtected ? 'Glass Broken' : 'Break Glass'}
          </button>
          
          <button 
            className={`mercy-btn recover ${isRecoveryMode ? 'active' : ''}`}
            onClick={() => setIsRecoveryMode(!isRecoveryMode)}
          >
            <Heart size={18} />
            {isRecoveryMode ? 'Recovery ON' : 'Recovery Mode'}
          </button>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default InsightDashboard;
