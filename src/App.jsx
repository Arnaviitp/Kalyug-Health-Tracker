import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Plus, Settings, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
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
  { id: 1, text: 'Morning Meditation (10m)', completed: false },
  { id: 2, text: 'Deep Work Session (90m)', completed: false },
  { id: 3, text: 'Drink 2L Water', completed: false }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
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
  
  const [todayStr, setTodayStr] = useState(() => formatDate(new Date()));

  useEffect(() => {
    // Check for day changes if tab is left open
    const interval = setInterval(() => {
      const currentDay = formatDate(new Date());
      if (currentDay !== todayStr) {
        setTodayStr(currentDay);
      }
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [todayStr]);

  useEffect(() => {
    // Reset habits if a new day started
    const lastLogin = localStorage.getItem('k-last-login');
    if (lastLogin && lastLogin !== todayStr) {
      setHabits(prev => prev.map(h => ({ ...h, completed: false })));
    }
    localStorage.setItem('k-last-login', todayStr);
    
    // Simulate initial page load
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

  // Sync logs when habits are toggled on the current day
  useEffect(() => {
    localStorage.setItem('k-habits-v2', JSON.stringify(habits));
    
    const completedToday = habits.filter(h => h.completed).length;
    setDailyLogs(prev => {
      const updated = { ...prev, [todayStr]: completedToday };
      localStorage.setItem('k-dailylogs', JSON.stringify(updated));
      return updated;
    });
  }, [habits, todayStr]);

  useEffect(() => {
    localStorage.setItem('k-protected-days', JSON.stringify(protectedDays));
  }, [protectedDays]);

  const toggleBreakGlass = () => {
    setProtectedDays(prev => ({
      ...prev,
      [todayStr]: !prev[todayStr]
    }));
  };

  const toggleHabit = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const addHabit = (text) => {
    if (!text.trim()) return;
    setHabits([...habits, { id: Date.now(), text, completed: false }]);
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

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

  // Calculate Streak Architecture
  const calculateStreaks = () => {
    const datesWithLogs = Object.keys(dailyLogs).filter(k => dailyLogs[k] > 0 || protectedDays[k]).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (datesWithLogs.length > 0) {
      // Calculate current streak
      let d = new Date();
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
      
      // Calculate longest streak
      let tempStreak = 1;
      longestStreak = 1;
      let prevDate = new Date(datesWithLogs[0]);
      for (let i = 1; i < datesWithLogs.length; i++) {
         const curr = new Date(datesWithLogs[i]);
         const diff = Math.round((curr - prevDate) / (1000 * 60 * 60 * 24));
         if (diff === 1) tempStreak++;
         else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
         }
         prevDate = curr;
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    }
    return { currentStreak, longestStreak };
  };

  const streaks = calculateStreaks();

  // Prepare Heatmap Data (Dynamically starting from the first logged day)
  const heatmapData = [];
  const anchorDate = new Date();
  const offsetSaturday = 6 - anchorDate.getDay();
  const endSaturday = new Date(anchorDate);
  endSaturday.setDate(anchorDate.getDate() + offsetSaturday);

  const firstLogDateStr = Object.keys(dailyLogs).sort()[0] || todayStr;
  const firstLogDate = new Date(firstLogDateStr);
  const startSundayOffset = firstLogDate.getDay();
  const startSunday = new Date(firstLogDate);
  startSunday.setDate(firstLogDate.getDate() - startSundayOffset);
  
  // Calculate how many days to plot (must be a multiple of 7 to form complete weeks)
  const totalDays = Math.round((endSaturday - startSunday) / (1000 * 60 * 60 * 24)) + 1;
  const daysToPlot = Math.max(7, totalDays);

  for (let i = 0; i < daysToPlot; i++) {
    const d = new Date(startSunday);
    d.setDate(startSunday.getDate() + i);
    const isFuture = d > anchorDate;
    const val = dailyLogs[formatDate(d)] || 0;
    heatmapData.push({ 
      date: d, 
      value: isFuture ? 0 : (val > 4 ? 4 : val),
      isFuture 
    });
  }

  // Prepare Bar Chart Data
  const chartData = [];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (let i = 6; i >= 0; i--) {
     const d = new Date();
     d.setDate(d.getDate() - i);
     chartData.push({
       label: dayNames[d.getDay()],
       val: dailyLogs[formatDate(d)] || 0
     });
  }

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  
  const totalCompletedEver = Object.values(dailyLogs).reduce((a, b) => a + (b || 0), 0);
  const totalXP = totalCompletedEver * 10;

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [cpOpen, setCpOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCpOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAiClick = () => {
    const aiTips = [
      "Consistency > Intensity. A 10 minute run every day beats a 3 hour run once a month.",
      "Your future is hidden in your daily routine.",
      "A year from now you will wish you had started today.",
      "Track your habits so you don't have to guess.",
      "Motivation gets you going, but discipline keeps you growing.",
      "Small wins lead to big changes. Celebrate your progress today.",
      "Focus on what you can control. The rest will follow."
    ];
    
    // Simulate thinking
    setCurrentTip("Analyzing your productivity patterns...");
    setAiModalOpen(true);
    
    setTimeout(() => {
      setCurrentTip(aiTips[Math.floor(Math.random() * aiTips.length)]);
    }, 1500);
  };

  const cpActions = {
    setTheme: (t) => setTheme(t),
    openAchievements: () => setAchievementsOpen(true),
    openSettings: () => setSettingsOpen(true),
    startTimer: () => {
      // This is a bit tricky without a ref to FocusTimer's internal state, 
      // but we can signal it via a custom event or a shared state if needed.
      // For now, let's just scroll to it.
      const timer = document.querySelector('.focus-timer');
      timer?.scrollIntoView({ behavior: 'smooth' });
    },
    focusAddHabit: () => {
      const input = document.querySelector('.add-habit-input');
      input?.focus();
      input?.scrollIntoView({ behavior: 'smooth' });
    },
    toggleRecovery: () => setIsRecoveryMode(prev => !prev),
    getAiInsight: () => handleAiClick()
  };

  if (!isLoaded) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <h2>Initializing Kalyug OS...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-text">
          <h1>Kalyug Health Tracker</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Building your legacy, one day at a time.</p>
          <LevelSystem totalXP={totalXP} />
        </div>
        
        <div className="theme-toggles glass-panel" style={{ padding: '8px' }}>
          <button className="theme-btn" onClick={() => setAchievementsOpen(true)} title="Trophy Room"><Trophy size={18} /></button>
          <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}><Sun size={18} /></button>
          <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}><Moon size={18} /></button>
          <button className={`theme-btn ${theme === 'oled' ? 'active' : ''}`} onClick={() => setTheme('oled')}><Monitor size={18} /></button>
          <button className="theme-btn" onClick={() => setSettingsOpen(true)} title="Settings"><Settings size={18} /></button>
        </div>
      </header>

      <motion.div 
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="main-column">
          <motion.section variants={itemVariants} className="glass-panel">
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Daily Actions</h2>
            <TactileLog 
              habits={habits} 
              toggleHabit={toggleHabit} 
              addHabit={addHabit}
              deleteHabit={deleteHabit}
              moveHabit={moveHabit}
            />
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
            <InsightDashboard 
              completedCount={completedCount} 
              totalCount={totalCount} 
              streaks={streaks}
              chartData={chartData}
              isRecoveryMode={isRecoveryMode}
              setIsRecoveryMode={setIsRecoveryMode}
              isProtected={protectedDays[todayStr]}
              toggleBreakGlass={toggleBreakGlass}
            />
          </motion.section>

          <motion.section variants={itemVariants} className="glass-panel">
            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>Focus Timer</h2>
            <FocusTimer />
          </motion.section>

          <motion.section variants={itemVariants} className="glass-panel" style={{ padding: '16px' }}>
            <AmbientSounds />
          </motion.section>
        </div>
      </motion.div>

      <footer className="footer">
        <p>© 2026 Kalyug.js Ecosystem. Driven by Data, Designed for Humans.</p>
      </footer>

      <button className="fab fab-ai" onClick={handleAiClick}>✨</button>
      <button className={`fab fab-scroll ${showScroll ? 'visible' : ''}`} onClick={scrollToTop}>↑</button>

      {/* AI Modal Overlay */}
      {aiModalOpen && (
        <div className="modal-overlay" onClick={() => setAiModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="ai-orb-container">
              <div className="ai-orb"></div>
            </div>
            <h2 className="modal-title">OS Intelligence</h2>
            <p className="typing-text" style={{ lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '16px' }}>{currentTip}</p>
            <button className="modal-close-btn" onClick={() => setAiModalOpen(false)}>Acknowledge</button>
          </div>
        </div>
      )}

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {achievementsOpen && <AchievementsModal onClose={() => setAchievementsOpen(false)} totalXP={totalXP} streaks={streaks} />}
      <CommandPalette isOpen={cpOpen} onClose={() => setCpOpen(false)} actions={cpActions} />
      {completedCount === totalCount && totalCount > 0 && <Confetti />}
    </div>
  );
}

export default App;
