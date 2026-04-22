import { motion } from 'framer-motion';

const RANKS = [
  "Awakened", "Seeker", "Adept", "Sage", "Master", "Legend", "Transcendent", "Eternal"
];

export default function LevelSystem({ totalXP }) {
  // Simple RPG math: Level = floor(sqrt(XP / 50)) + 1
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
      className="level-container"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="level-badge-wrapper">
        <div className="level-badge">Lvl {currentLevel}</div>
        <div className="rank-badge">{currentRank}</div>
      </div>
      <div style={{ flexGrow: 1 }}>
        <div className="xp-bar-wrapper">
          <motion.div 
            className="xp-bar-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          ></motion.div>
        </div>
        <div className="xp-text">{totalXP} / {nextLevelXP} XP</div>
      </div>
    </motion.div>
  );
}
