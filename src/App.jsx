import { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, Monitor, Plus, Settings, Trophy, Zap, Check, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TactileLog from './components/TactileLog';
import CommitmentMap from './components/CommitmentMap';
import InsightDashboard from './components/InsightDashboard';
import FocusTimer from './components/FocusTimer';
import LevelSystem from './components/LevelSystem';
import DailyJournal from './components/DailyJournal';
import AmbientSounds from './components/AmbientSounds';
import SettingsModal from './components/SettingsModal';
import AchievementsModal from './components/AchievementsModal';
import CommandPalette from './components/CommandPalette';
import Confetti from './components/Confetti';
import './index.css';

const formatDate = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const initialHabits = [
  { id: 1, text: 'Morning Meditation (10m)', completed: false, category: 'mental' },
  { id: 2, text: 'Deep Work Session (90m)', completed: false, category: 'work' },
  { id: 3, text: 'Drink 2L Water', completed: false, category: 'physical' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

function App() {
  // --- State Hooks ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('k-theme') || 'dark');
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('k-habits-v2');
    return saved ? JSON.parse(saved) : initialHabits;
  });
  const [dailyLogs, setDailyLogs] = useState(() => {
    const saved = localStorage.getItem('k-dailylogs');
    return saved ? JSON.parse(saved) : {};
  });
  const [protectedDays, setProtectedDays] = useState(() => {
    const saved = localStorage.getItem('k-protected-days');
    return saved ? JSON.parse(saved) : {};
  });
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [todayStr, setTodayStr] = useState(() => formatDate(new Date()));
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [cpOpen, setCpOpen] = useState(false);

  // Daily Quest Initialization
  const [dailyQuest, setDailyQuest] = useState(() => {
    const saved = localStorage.getItem('k-daily-quest');
    const today = formatDate(new Date());
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed;
    }
    const categories = ['physical', 'mental', 'work', 'soul'];
    const quest = {
      date: today,
      category: categories[Math.floor(Math.random() * categories.length)],
      completed: false
    };
    localStorage.setItem('k-daily-quest', JSON.stringify(quest));
    return quest;
  });

  // --- Derived Data ---
  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const totalCompletedEver = Object.values(dailyLogs).reduce((a, b) => a + (b || 0), 0);
  let totalXP = totalCompletedEver * 10;
  if (dailyQuest.completed) totalXP += 50;

  // Level tracking state (needs totalXP for initial value)
  const [lastLevel, setLastLevel] = useState(() => Math.floor(Math.sqrt(totalXP / 50)) + 1);

  // --- Derived Data (Memoized) ---
  const streaks = useMemo(() => {
    const datesWithLogs = Object.keys(dailyLogs).filter(k => dailyLogs[k] > 0 || protectedDays[k]).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (datesWithLogs.length > 0) {
      let d = new Date();
      // If today is not completed and not protected, check from yesterday
      if ((!dailyLogs[todayStr] || dailyLogs[todayStr] === 0) && !protectedDays[todayStr]) {
        d.setDate(d.getDate() - 1);
      }
      
      while (true) {
        const dStr = formatDate(d);
        if (dailyLogs[dStr] > 0 || protectedDays[dStr]) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
        } else break;
      }

      let tempStreak = 0;
      let sortedDates = [...datesWithLogs];
      if (sortedDates.length > 0) {
        tempStreak = 1;
        longestStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i-1]);
          const curr = new Date(sortedDates[i]);
          const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }
    return { currentStreak, longestStreak };
  }, [dailyLogs, protectedDays, todayStr]);

  const chartData = useMemo(() => {
    const data = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      data.push({ label: dayNames[d.getDay()], val: dailyLogs[formatDate(d)] || 0 });
    }
    return data;
  }, [dailyLogs]);

  const heatmapData = useMemo(() => {
    const data = [];
    const anchorDate = new Date();
    const offsetSaturday = 6 - anchorDate.getDay();
    const endSaturday = new Date(anchorDate);
    endSaturday.setDate(anchorDate.getDate() + offsetSaturday);
    const firstLogDateStr = Object.keys(dailyLogs).sort()[0] || todayStr;
    const firstLogDate = new Date(firstLogDateStr);
    const startSunday = new Date(firstLogDate);
    startSunday.setDate(firstLogDate.getDate() - firstLogDate.getDay());
    const totalDays = Math.round((endSaturday - startSunday) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < Math.max(7, totalDays); i++) {
      const d = new Date(startSunday); d.setDate(startSunday.getDate() + i);
      const val = dailyLogs[formatDate(d)] || 0;
      data.push({ date: d, value: d > anchorDate ? 0 : (val > 4 ? 4 : val), isFuture: d > anchorDate });
    }
    return data;
  }, [dailyLogs, todayStr]);

  // --- Effect Hooks ---
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDay = formatDate(new Date());
      if (currentDay !== todayStr) setTodayStr(currentDay);
    }, 60000);
    return () => clearInterval(interval);
  }, [todayStr]);

  useEffect(() => {
    const lastLogin = localStorage.getItem('k-last-login');
    if (lastLogin && lastLogin !== todayStr) {
      setHabits(prev => prev.map(h => ({ ...h, completed: false })));
    }
    localStorage.setItem('k-last-login', todayStr);
    const timer = setTimeout(() => setIsLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, [todayStr]);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('k-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('k-habits-v2', JSON.stringify(habits));
    setDailyLogs(prev => {
      const updated = { ...prev, [todayStr]: completedCount };
      localStorage.setItem('k-dailylogs', JSON.stringify(updated));
      return updated;
    });

    // Quest Completion Check
    const questHabits = habits.filter(h => h.category === dailyQuest.category);
    if (questHabits.length > 0 && questHabits.every(h => h.completed) && !dailyQuest.completed) {
      setDailyQuest(prev => ({ ...prev, completed: true }));
      addToast("Quest Complete!", `You've mastered today's ${dailyQuest.category} priority!`, "✨");
    }
  }, [habits, todayStr, dailyQuest.category, dailyQuest.completed, completedCount]);

  useEffect(() => {
    const currentLevel = Math.floor(Math.sqrt(totalXP / 50)) + 1;
    if (currentLevel > lastLevel) {
      setLastLevel(currentLevel);
      addToast("Level Up!", `You've reached Level ${currentLevel}!`, "🚀");
    }
  }, [totalXP, lastLevel]);

  useEffect(() => {
    localStorage.setItem('k-protected-days', JSON.stringify(protectedDays));
  }, [protectedDays]);

  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    const saved = localStorage.getItem('k-unlocked-achievements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('k-unlocked-achievements', JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCpOpen(true);
      }
      if (e.key === 'z' || e.key === 'Z') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          setIsZenMode(prev => !prev);
        }
      }
      if (e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          handleAiClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Achievement Check
  useEffect(() => {
    const achievementsList = [
      { id: 'first-xp', title: 'First Steps', condition: totalXP > 0 },
      { id: 'streak-3', title: 'Consistency', condition: streaks.longestStreak >= 3 },
      { id: 'streak-7', title: 'Unstoppable', condition: streaks.longestStreak >= 7 },
      { id: 'xp-100', title: 'Centurion', condition: totalXP >= 100 },
      { id: 'xp-1000', title: 'Mastery', condition: totalXP >= 1000 },
    ];

    achievementsList.forEach(a => {
      if (a.condition && !unlockedAchievements.includes(a.id)) {
        setUnlockedAchievements(prev => [...prev, a.id]);
        addToast("Achievement Unlocked!", a.title, "🏆");
      }
    });
  }, [totalXP, streaks, unlockedAchievements]);

  // --- Helper Functions ---
  const addToast = (title, message, icon = "🏆") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const toggleBreakGlass = () => {
    setProtectedDays(prev => ({ ...prev, [todayStr]: !prev[todayStr] }));
  };

  const toggleHabit = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const addHabit = (text, category = 'work') => {
    if (!text.trim()) return;
    setHabits([...habits, { id: Date.now(), text, completed: false, category }]);
  };

  const deleteHabit = (id) => setHabits(habits.filter(h => h.id !== id));

  const moveHabit = (index, direction) => {
    const newHabits = [...habits];
    if (direction === 'up' && index > 0) {
      [newHabits[index - 1], newHabits[index]] = [newHabits[index], newHabits[index - 1]];
      setHabits(newHabits);
    } else if (direction === 'down' && index < newHabits.length - 1) {
      [newHabits[index + 1], newHabits[index]] = [newHabits[index], newHabits[index + 1]];
      setHabits(newHabits);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });


  const handleAiClick = () => {
    const aiTips = [
      "Consistency > Intensity. A 10 minute run every day beats a 3 hour run once a month.",
      "Your future is hidden in your daily routine.",
      "A year from now you will wish you had started today.",
      "Track your habits so you don't have to guess.",
      "Motivation gets you going, but discipline keeps you growing.",
      "Small wins lead to big changes. Celebrate your progress today.",
      "Focus on what you can control. The rest will follow.",
      "Energy flows where attention goes. Direct your focus to your top priority.",
      "The secret of your success is found in your daily agenda.",
      "Do something today that your future self will thank you for.",
      "Don't count the days, make the days count.",
      "You don't have to be great to start, but you have to start to be great."
    ];
    const categoryCounts = habits.reduce((acc, h) => {
      acc[h.category] = (acc[h.category] || 0) + (h.completed ? 1 : 0);
      return acc;
    }, {});

    const aiPools = {
      zeroProgress: [
        "I've analyzed your current state. The inertia is high, but the potential is higher. Start with the smallest action: " + (habits[0]?.text || "drinking a glass of water") + ".",
        "Energy levels appear stagnant. A single small win can trigger a cascade of productivity. What's the easiest task on your list?",
        "Sensors indicate a high activation energy required. Let's lower the bar. Focus on just one habit for 5 minutes."
      ],
      allCompleted: [
        "Data synchronization complete. You've achieved a state of high coherence today. Maintain this alignment to compound your progress.",
        "Total alignment detected. Your daily actions are perfectly synced with your long-term goals. Exceptional performance.",
        "System check: 100% efficiency. You've cleared the board. Use this momentum to reflect or rest deeply."
      ],
      physicalDeficit: [
        "My sensors detect a deficit in Physical vitality. Your body is the vessel for your mind. Prioritize your physical habits to sustain long-term performance.",
        "Biological systems need maintenance. Movement or hydration should be your next priority to maintain cognitive output.",
        "Warning: Physical energy reserves are low. Realigning focus to your health habits will prevent burnout."
      ],
      highStreak: [
        `Neural patterns show a strong momentum of ${streaks.currentStreak} days. You are reaching a flow state. Do not let the chain break today.`,
        `The ${streaks.currentStreak}-day chain is a powerful psychological asset. Protect it at all costs today.`,
        `Momentum is your greatest ally. At ${streaks.currentStreak} days, habits are becoming hardwired. Keep pushing.`
      ]
    };

    let smartTip = "";
    if (completedCount === 0) smartTip = aiPools.zeroProgress[Math.floor(Math.random() * aiPools.zeroProgress.length)];
    else if (completedCount === habits.length) smartTip = aiPools.allCompleted[Math.floor(Math.random() * aiPools.allCompleted.length)];
    else if (!categoryCounts['physical'] && habits.some(h => h.category === 'physical')) smartTip = aiPools.physicalDeficit[Math.floor(Math.random() * aiPools.physicalDeficit.length)];
    else if (streaks.currentStreak > 5) smartTip = aiPools.highStreak[Math.floor(Math.random() * aiPools.highStreak.length)];
    else smartTip = aiTips[Math.floor(Math.random() * aiTips.length)];

    setAiModalOpen(true);
    
    // Check if we should show full processing or skip for speed
    const lastAiTime = window._lastAiTime || 0;
    const now = Date.now();
    window._lastAiTime = now;
    const skipProcessing = now - lastAiTime < 30000; // Skip if clicked in last 30s

    if (skipProcessing) {
      setCurrentTip(smartTip);
      return;
    }

    setCurrentTip("Accessing neural logs...");
    const steps = [
      "Accessing neural logs...",
      "Analyzing daily patterns...",
      "Synthesizing actionable insights...",
      "Correlating streak data...",
      "Optimizing cognitive load...",
      "Syncing with HabitArc OS...",
      smartTip
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length - 1) {
        setCurrentTip(steps[i]);
        i++;
      } else {
        setCurrentTip(steps[i]);
        clearInterval(interval);
      }
    }, 600);
  };


  const cpActions = {
    setTheme: (t) => setTheme(t),
    openAchievements: () => setAchievementsOpen(true),
    openSettings: () => setSettingsOpen(true),
    startTimer: () => document.querySelector('.focus-timer')?.scrollIntoView({ behavior: 'smooth' }),
    focusAddHabit: () => {
      const input = document.querySelector('.add-habit-input');
      input?.focus(); input?.scrollIntoView({ behavior: 'smooth' });
    },
    toggleRecovery: () => setIsRecoveryMode(prev => !prev),
    getAiInsight: () => handleAiClick(),
    toggleZen: () => setIsZenMode(prev => !prev)
  };

  if (!isLoaded) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <h2 style={{ marginTop: '20px', letterSpacing: '2px', fontWeight: '300' }}>INITIALIZING HABITARC OS...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-text">
          <h1>HabitArc</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Building your legacy, one day at a time.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <LevelSystem totalXP={totalXP} />
            <motion.div 
              className={`quest-badge ${dailyQuest.completed ? 'completed' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="quest-icon">
                {dailyQuest.completed ? <Trophy size={14} /> : <Zap size={14} />}
              </div>
              <div className="quest-details">
                <span className="quest-label">DAILY QUEST</span>
                <span className="quest-name">{dailyQuest.category.toUpperCase()} MASTER</span>
              </div>
              {dailyQuest.completed && <Check size={14} className="quest-check" />}
            </motion.div>
          </div>
        </div>
        <div className="theme-toggles glass-panel" style={{ padding: '8px' }}>
          <button className="theme-btn" onClick={() => setAchievementsOpen(true)} title="Trophy Room"><Trophy size={18} /></button>
          <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}><Sun size={18} /></button>
          <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}><Moon size={18} /></button>
          <button className={`theme-btn ${theme === 'oled' ? 'active' : ''}`} onClick={() => setTheme('oled')}><Monitor size={18} /></button>
          <button className="theme-btn" onClick={() => setSettingsOpen(true)} title="Settings"><Settings size={18} /></button>
          <button className={`theme-btn ${isZenMode ? 'active' : ''}`} onClick={() => setIsZenMode(!isZenMode)} title="Zen Mode" style={{ marginLeft: '12px', background: isZenMode ? 'var(--accent-primary)' : '', color: isZenMode ? 'white' : '' }}>
            <Zap size={18} />
          </button>
        </div>
      </header>

      <motion.div className="dashboard-grid" variants={containerVariants} initial="hidden" animate="visible">
        <div className="main-column">
          <motion.section variants={itemVariants} className="glass-panel">
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Daily Actions</h2>
            <TactileLog habits={habits} toggleHabit={toggleHabit} addHabit={addHabit} deleteHabit={deleteHabit} moveHabit={moveHabit} />
          </motion.section>
          <motion.section variants={itemVariants} className="glass-panel">
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Commitment Map</h2>
            <CommitmentMap data={heatmapData} />
          </motion.section>
          <motion.section variants={itemVariants} className="glass-panel">
            <DailyJournal todayStr={todayStr} />
          </motion.section>
        </div>
        <div className="side-column">
          <motion.section variants={itemVariants} className={`glass-panel ${isRecoveryMode ? 'recovery-mode-active' : ''}`}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Insights</h2>
            <InsightDashboard habits={habits} completedCount={completedCount} totalCount={totalCount} streaks={streaks} chartData={chartData} isRecoveryMode={isRecoveryMode} setIsRecoveryMode={setIsRecoveryMode} isProtected={protectedDays[todayStr]} toggleBreakGlass={toggleBreakGlass} />
          </motion.section>
          <motion.section variants={itemVariants} className="glass-panel">
            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>Focus Timer</h2>
            <FocusTimer />
          </motion.section>
          <motion.section variants={itemVariants} className="glass-panel" style={{ padding: '16px' }}>
            <AmbientSounds />
          </motion.section>
          <motion.section variants={itemVariants} className="glass-panel command-center-info">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} /> Command Center
            </h3>
            <div className="shortcut-list">
              <div className="shortcut-item">
                <span className="shortcut-label">Command Palette</span>
                <kbd className="shortcut-key">Ctrl + K</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-label">Toggle Zen Mode</span>
                <kbd className="shortcut-key">Z</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-label">Neural Log</span>
                <kbd className="shortcut-key">Shift + A</kbd>
              </div>
            </div>
          </motion.section>
        </div>
      </motion.div>

      <footer className="footer">
        <p>© 2026 HabitArc Ecosystem. Driven by Data, Designed for Humans.</p>
      </footer>

      <button className="fab fab-ai" onClick={handleAiClick}>✨</button>
      <button className={`fab fab-scroll ${showScroll ? 'visible' : ''}`} onClick={scrollToTop}>↑</button>

      {aiModalOpen && (
        <div className="modal-overlay" onClick={() => setAiModalOpen(false)}>
          <div className="modal-content ai-modal-premium" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="ai-orb-container">
              <div className="ai-orb"></div>
              <div className="ai-orb-ring"></div>
              <div className="ai-orb-ring"></div>
            </div>
            <h2 className="modal-title" style={{ letterSpacing: '3px', color: 'var(--accent-primary)' }}>NEURAL SYNC</h2>
            <div className="neural-sync-progress">
              {currentTip.includes('...') && <motion.div className="neural-sync-bar" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3 }} />}
            </div>
            <p className="typing-text" style={{ lineHeight: '1.7', fontSize: '1.15rem', marginBottom: '32px', minHeight: '100px', fontWeight: '300' }}>
              {currentTip}
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="modal-close-btn premium" onClick={() => setAiModalOpen(false)} style={{ flex: 1 }}>Acknowledge</button>
              {completedCount < totalCount && (
                <button 
                  className="modal-close-btn premium highlighted" 
                  onClick={() => { setAiModalOpen(false); setIsZenMode(true); }}
                  style={{ flex: 1.2 }}
                >
                  <Zap size={16} /> Initiate Zen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {achievementsOpen && <AchievementsModal onClose={() => setAchievementsOpen(false)} totalXP={totalXP} streaks={streaks} />}
      <CommandPalette isOpen={cpOpen} onClose={() => setCpOpen(false)} actions={cpActions} />
      {completedCount === totalCount && totalCount > 0 && <Confetti />}

      <AnimatePresence>
        {isZenMode && (
          <motion.div 
            className="zen-mode-overlay" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="zen-bg-glow"></div>
            <button className="zen-mode-btn exit" onClick={() => setIsZenMode(false)}>
              <Minimize2 size={18} /> Exit Zen
            </button>
            <div className="zen-content">
              <motion.div 
                initial={{ y: 40, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.4, duration: 0.8 }}
                style={{ width: '100%' }}
              >
                <div className="breathing-container">
                  <div className="breathing-circle"></div>
                  <div className="breathing-circle-inner"></div>
                  <p className="breathing-label">Breathe In... Breathe Out...</p>
                </div>

                <h2 className="zen-title">DEEP FOCUS</h2>
                <FocusTimer />
                <div className="zen-sounds-container">
                  <AmbientSounds />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id} className="toast glass-panel" initial={{ opacity: 0, x: 100, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}>
              <div className="toast-icon">{toast.icon}</div>
              <div className="toast-content">
                <div className="toast-title">{toast.title}</div>
                <div className="toast-msg">{toast.message}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
