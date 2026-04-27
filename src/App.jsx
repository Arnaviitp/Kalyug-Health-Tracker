import { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, Monitor, Plus, Settings, Trophy, Zap, Check, Minimize2, TrendingUp, Smile, Meh, Frown, Archive } from 'lucide-react';
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
  { id: 1, text: 'Morning Meditation (10m)', completed: false, category: 'mental', subtasks: [] },
  { id: 2, text: 'Deep Work Session (90m)', completed: false, category: 'work', subtasks: [] },
  { id: 3, text: 'Drink 2L Water', completed: false, category: 'physical', subtasks: [] }
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
  const [moods, setMoods] = useState(() => {
    const saved = localStorage.getItem('k-moods');
    return saved ? JSON.parse(saved) : {};
  });
  const [archivedHabits, setArchivedHabits] = useState(() => {
    const saved = localStorage.getItem('k-archived-habits');
    return saved ? JSON.parse(saved) : [];
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
  const [addHabitOpen, setAddHabitOpen] = useState(false);

  // --- Focus Timer State (Lifted) ---
  const [timerTimeLeft, setTimerTimeLeft] = useState(25 * 60);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState('pomodoro'); // pomodoro, shortBreak, longBreak
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(true);
  const [timerHistory, setTimerHistory] = useState(() => {
    const saved = localStorage.getItem('k-focus-history');
    return saved ? JSON.parse(saved) : [];
  });

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

  const toggleSubtask = (habitId, subtaskId) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const subtasks = (h.subtasks || []).map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...h, subtasks };
      }
      return h;
    }));
  };

  const addSubtask = (habitId, text) => {
    if (!text.trim()) return;
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        return { 
          ...h, 
          subtasks: [...(h.subtasks || []), { id: Date.now(), text, completed: false }] 
        };
      }
      return h;
    }));
  };

  const deleteSubtask = (habitId, subtaskId) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        return { 
          ...h, 
          subtasks: (h.subtasks || []).filter(s => s.id !== subtaskId) 
        };
      }
      return h;
    }));
  };

  const addHabit = (text, category = 'work') => {
    if (!text.trim()) return;
    setHabits([...habits, { id: Date.now(), text, completed: false, category, subtasks: [] }]);
  };

  const deleteHabit = (id) => setHabits(habits.filter(h => h.id !== id));

  const archiveHabit = (id) => {
    const habitToArchive = habits.find(h => h.id === id);
    if (habitToArchive) {
      setArchivedHabits(prev => [...prev, habitToArchive]);
      setHabits(prev => prev.filter(h => h.id !== id));
      addToast("Habit Archived", habitToArchive.text, "📦");
    }
  };

  const restoreHabit = (id) => {
    const habitToRestore = archivedHabits.find(h => h.id === id);
    if (habitToRestore) {
      setHabits(prev => [...prev, habitToRestore]);
      setArchivedHabits(prev => prev.filter(h => h.id !== id));
      addToast("Habit Restored", habitToRestore.text, "♻️");
    }
  };

  const clearArchive = () => {
    if (window.confirm("Clear all archived habits?")) {
      setArchivedHabits([]);
      addToast("Archive Cleared", "All history removed.", "🗑️");
    }
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

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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
      "You don't have to be great to start, but you have to start to be great.",
      "Focus is the art of knowing what to ignore.",
      "Your deep work capacity is like a muscle. Train it daily.",
      "A 25-minute sprint is better than 2 hours of distraction."
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
    const now = Date.now();
    const lastAiTime = window._lastAiTime || 0;
    window._lastAiTime = now;
    const skipProcessing = now - (window._lastAiTimeLong || 0) < 60000; // Skip long animation if clicked in last 60s
    window._lastAiTimeLong = now;

    if (skipProcessing) {
      setCurrentTip(smartTip);
      return;
    }

    setCurrentTip("Accessing neural logs...");
    const steps = [
      "Accessing neural logs...",
      "Analyzing daily patterns...",
      `Current Sync: ${productivityScore}% Efficiency`,
      "Synthesizing actionable insights...",
      `Correlating ${streaks.currentStreak}-day streak data...`,
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

  const totalFocusMinutes = useMemo(() => {
    return timerHistory.reduce((acc, session) => acc + (session.duration || 0), 0);
  }, [timerHistory]);

  // --- Derived Data ---
  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const totalCompletedEver = Object.values(dailyLogs).reduce((a, b) => a + (b || 0), 0);

  const streaks = useMemo(() => {
    const dates = Object.keys(dailyLogs).sort();
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    let current = 0;
    let longest = 0;
    let temp = 0;
    
    // Simple streak logic
    const today = new Date(todayStr);
    let checkDate = new Date(today);
    
    while (dailyLogs[formatDate(checkDate)] > 0) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Longest calculation
    let lastDate = null;
    dates.forEach(d => {
      if (!lastDate) {
        temp = 1;
      } else {
        const diff = (new Date(d) - new Date(lastDate)) / (1000 * 60 * 60 * 24);
        if (diff === 1) temp++;
        else temp = 1;
      }
      longest = Math.max(longest, temp);
      lastDate = d;
    });
    
    return { currentStreak: current, longestStreak: longest };
  }, [dailyLogs, todayStr]);
  
  // Productivity Score Calculation
  const productivityScore = useMemo(() => {
    const habitScore = totalCount === 0 ? 0 : (completedCount / totalCount) * 60;
    const streakBonus = Math.min(streaks.currentStreak * 2, 20);
    const questBonus = dailyQuest.completed ? 20 : 0;
    return Math.round(habitScore + streakBonus + questBonus);
  }, [completedCount, totalCount, streaks.currentStreak, dailyQuest.completed]);

  const attributesXP = useMemo(() => {
    const xp = { physical: 0, mental: 0, work: 0, soul: 0, focus: 0 };
    Object.keys(dailyLogs).forEach(date => {
      habits.forEach(h => {
        const cat = h.category || 'work';
        if (!xp[cat]) xp[cat] = 0;
        if (h.completed) {
          xp[cat] += 10;
        }
        (h.subtasks || []).forEach(s => {
          if (s.completed) xp[cat] += 5;
        });
      });
    });
    // Add bonus for quest
    const questCat = dailyQuest.category || 'work';
    if (!xp[questCat]) xp[questCat] = 0;
    if (dailyQuest.completed) xp[questCat] += 50;
    
    xp.focus = Math.floor((totalFocusMinutes || 0) / 2);
    return xp;
  }, [habits, dailyLogs, dailyQuest, totalFocusMinutes]);

  let totalXP = Object.values(attributesXP).reduce((a, b) => (a || 0) + (b || 0), 0);
  totalXP += Math.floor((totalFocusMinutes || 0) / 5); // 1 XP for every 5 minutes of focus
  totalXP = isNaN(totalXP) ? 0 : totalXP;

  const momentumScore = useMemo(() => {
    const base = productivityScore;
    const moodFactor = moods[todayStr] === 'great' ? 1.2 : moods[todayStr] === 'low' ? 0.8 : 1;
    const focusFactor = Math.min(1.5, 1 + (totalFocusMinutes / 120));
    return Math.round(base * moodFactor * focusFactor);
  }, [productivityScore, moods, todayStr, totalFocusMinutes]);

  const aiProphecy = useMemo(() => {
    if (totalCount === 0) return null;
    const progress = completedCount / totalCount;
    const attributeNames = { physical: 'Vitality', mental: 'Intellect', work: 'Discipline', soul: 'Zen', focus: 'Deep Focus' };
    
    const moodHistory = Object.values(moods).slice(-7);
    const lowMoods = moodHistory.filter(m => m === 'low').length;
    const highMoods = moodHistory.filter(m => m === 'great').length;

    const lowCategories = ['physical', 'mental', 'work', 'soul'].filter(cat => 
      habits.some(h => h.category === cat) && !habits.find(h => h.category === cat && h.completed)
    );

    if (progress === 1) {
      if (highMoods > 3) return "Flow State Detected: Your neural efficiency is at its peak. This 'God Mode' trajectory suggests a significant cognitive evolution in the next 72 hours.";
      return "System Overload: Perfection detected. Your cognitive baseline has shifted upwards. Expect a surge in creative clarity tomorrow.";
    }

    if (lowMoods > 2) {
      return "Critical Warning: System fatigue detected. Prioritize 'Zen' and 'Vitality' protocols to prevent a total neural collapse. Momentum is at risk.";
    }

    if (totalFocusMinutes > 120) {
      return "Hyper-Focus Loop: Your deep work capacity has exceeded the daily average. Be wary of 'Intellect' burnout. Realign with 'Soul' habits.";
    }

    if (progress > 0.7) return `The stars align with your discipline. A major breakthrough in your ${attributeNames[lowCategories[0]] || 'Discipline'} sector is predicted within 48 hours.`;
    
    if (lowCategories.includes('physical')) return "Your bio-rhythms show subtle fluctuations. Realigning with 'Vitality' habits will stabilize your neural output.";
    
    if (lowCategories.includes('mental')) return "Mental clarity is currently throttled. A brief focus session in 'Intellect' will unlock 15% more processing power.";
    
    return "Neural patterns are stabilizing. Consistency is your greatest multiplier. Stay the course.";
  }, [completedCount, totalCount, habits, moods, totalFocusMinutes]);

  // Level tracking state (needs totalXP for initial value)
  const [lastLevel, setLastLevel] = useState(() => Math.floor(Math.sqrt(totalXP / 50)) + 1);

  // --- Derived Data (Memoized) ---

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

  useEffect(() => {
    localStorage.setItem('k-moods', JSON.stringify(moods));
  }, [moods]);

  useEffect(() => {
    localStorage.setItem('k-archived-habits', JSON.stringify(archivedHabits));
  }, [archivedHabits]);

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

  const cpActions = {
    setTheme: (t) => setTheme(t),
    openAchievements: () => setAchievementsOpen(true),
    openSettings: () => setSettingsOpen(true),
    scrollToSection: (id) => scrollToSection(id),
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
      <header className="header" style={{ marginBottom: '24px' }}>
        <div className="header-text">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            HabitArc
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '400' }}
          >
            Sculpt your destiny, one habit at a time.
          </motion.p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
            <LevelSystem totalXP={totalXP} attributes={attributesXP} />
            <motion.div 
              className={`quest-badge ${dailyQuest.completed ? 'completed' : ''}`}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '10px 20px', 
                borderRadius: '24px',
                background: dailyQuest.completed ? 'var(--success-color)' : 'rgba(var(--bg-primary-rgb), 0.5)',
                color: dailyQuest.completed ? 'white' : 'var(--text-primary)',
                border: dailyQuest.completed ? 'none' : '1px solid var(--glass-border)',
                boxShadow: dailyQuest.completed ? '0 8px 20px var(--success-glow)' : 'none'
              }}
            >
              <div className="quest-icon" style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: dailyQuest.completed ? 'rgba(255,255,255,0.2)' : 'var(--accent-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: dailyQuest.completed ? 'white' : 'var(--accent-primary)'
              }}>
                {dailyQuest.completed ? <Trophy size={14} /> : <Zap size={14} />}
              </div>
              <div className="quest-details" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="quest-label" style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.8, letterSpacing: '1px' }}>DAILY QUEST</span>
                <span className="quest-name" style={{ fontSize: '0.8rem', fontWeight: '700' }}>{dailyQuest.category.toUpperCase()} MASTER</span>
              </div>
              {dailyQuest.completed && <Check size={16} className="quest-check" strokeWidth={3} />}
            </motion.div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="mood-selector glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.6, letterSpacing: '1px' }}>MOOD</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { val: 'great', emoji: '🔥', icon: <Zap size={16} />, color: 'var(--accent-primary)' },
                { val: 'good', emoji: '😊', icon: <Smile size={16} />, color: 'var(--success-color)' },
                { val: 'neutral', emoji: '😐', icon: <Meh size={16} />, color: 'var(--text-secondary)' },
                { val: 'low', emoji: '😔', icon: <Frown size={16} />, color: '#ef4444' }
              ].map(m => (
                <motion.button
                  key={m.val}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMoods(prev => ({ ...prev, [todayStr]: m.val }))}
                  style={{ 
                    background: moods[todayStr] === m.val ? m.color : 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: moods[todayStr] === m.val ? 'white' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  title={m.val.toUpperCase()}
                >
                  {moods[todayStr] === m.val ? m.icon : m.emoji}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="theme-toggles glass-panel" style={{ padding: '8px', gap: '4px' }}>
          <button className="theme-btn" onClick={() => setAchievementsOpen(true)} title="Trophy Room"><Trophy size={18} /></button>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 8px' }}></div>
          <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}><Sun size={18} /></button>
          <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}><Moon size={18} /></button>
          <button className={`theme-btn ${theme === 'oled' ? 'active' : ''}`} onClick={() => setTheme('oled')}><Monitor size={18} /></button>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 8px' }}></div>
          <button className="theme-btn" onClick={() => setSettingsOpen(true)} title="Settings"><Settings size={18} /></button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`theme-btn ${isZenMode ? 'active' : ''}`} 
            onClick={() => setIsZenMode(!isZenMode)} 
            title="Initiate Zen" 
            style={{ marginLeft: '8px', background: isZenMode ? 'var(--accent-primary)' : 'rgba(var(--accent-primary), 0.1)', color: isZenMode ? 'white' : 'var(--accent-primary)' }}
          >
            <Zap size={18} />
          </motion.button>
        </div>
      </div>
    </header>

      <motion.div 
        className="dashboard-grid" 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
      >
        <div className="main-column">
          <motion.section id="habits-section" variants={itemVariants} className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Daily Actions</h2>
              <div style={{ padding: '4px 12px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                {completedCount}/{totalCount} COMPLETED
              </div>
            </div>
            <TactileLog 
              habits={habits} 
              toggleHabit={toggleHabit} 
              addHabit={addHabit} 
              deleteHabit={deleteHabit} 
              archiveHabit={archiveHabit}
              moveHabit={moveHabit} 
              toggleSubtask={toggleSubtask}
              addSubtask={addSubtask}
              deleteSubtask={deleteSubtask}
            />
          </motion.section>
          
          <motion.section id="insights-section" variants={itemVariants} className="glass-panel">
            <h2 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: '800' }}>Commitment Map</h2>
            <CommitmentMap data={heatmapData} />
          </motion.section>

          <motion.section id="journal-section" variants={itemVariants} className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Neural Logs</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <DailyJournal todayStr={todayStr} />
          </motion.section>
        </div>

        <div className="side-column">
          <motion.section variants={itemVariants} className={`glass-panel ${isRecoveryMode ? 'recovery-mode-active' : ''}`}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: '800' }}>Architecture</h2>
            <InsightDashboard 
              habits={habits} 
              completedCount={completedCount} 
              totalCount={totalCount} 
              streaks={streaks} 
              chartData={chartData} 
              isRecoveryMode={isRecoveryMode} 
              setIsRecoveryMode={setIsRecoveryMode} 
              isProtected={protectedDays[todayStr]} 
              toggleBreakGlass={toggleBreakGlass}
              productivityScore={productivityScore}
              aiProphecy={aiProphecy}
              moods={moods}
              todayStr={todayStr}
              timerHistory={timerHistory}
            />
          </motion.section>

          <motion.section id="focus-section" variants={itemVariants} className="glass-panel" style={{ background: 'linear-gradient(180deg, var(--glass-bg), rgba(var(--accent-primary-rgb), 0.05))' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>Focus Chamber</h2>
            <FocusTimer 
              timeLeft={timerTimeLeft} 
              setTimeLeft={setTimerTimeLeft} 
              isActive={timerIsActive} 
              setIsActive={setTimerIsActive} 
              mode={timerMode} 
              setMode={setTimerMode}
              soundEnabled={timerSoundEnabled}
              setSoundEnabled={setTimerSoundEnabled}
              history={timerHistory}
              setHistory={setTimerHistory}
            />
          </motion.section>

          <motion.section variants={itemVariants} className="glass-panel" style={{ padding: '20px' }}>
            <AmbientSounds />
          </motion.section>

          <motion.section variants={itemVariants} className="glass-panel command-center-info" style={{ background: 'rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Zap size={14} /> OS Shortcuts
            </h3>
            <div className="shortcut-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="shortcut-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="shortcut-label" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Command Palette</span>
                <kbd className="shortcut-key" style={{ background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--glass-border)', fontWeight: '700' }}>Ctrl + K</kbd>
              </div>
              <div className="shortcut-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="shortcut-label" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Zen Mode</span>
                <kbd className="shortcut-key" style={{ background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--glass-border)', fontWeight: '700' }}>Z</kbd>
              </div>
              <div className="shortcut-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="shortcut-label" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Neural Sync</span>
                <kbd className="shortcut-key" style={{ background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--glass-border)', fontWeight: '700' }}>Shift + A</kbd>
              </div>
            </div>
          </motion.section>
        </div>
      </motion.div>

      <footer className="footer" style={{ marginTop: '48px', padding: '32px 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
          © 2026 HabitArc Ecosystem. <span style={{ color: 'var(--accent-primary)' }}>Precision Built</span> for Peak Performance.
        </p>
      </footer>

      <motion.button 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
        className="fab fab-ai" 
        onClick={handleAiClick} 
        title="Neural Sync"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          boxShadow: '0 8px 32px var(--accent-glow)',
          width: '64px',
          height: '64px',
          fontSize: '1.5rem'
        }}
      >
        ✨
      </motion.button>
      
      <button className={`fab fab-scroll ${showScroll ? 'visible' : ''}`} onClick={scrollToTop} style={{ bottom: '100px' }}>↑</button>

      <AnimatePresence>
        {aiModalOpen && (
          <div className="modal-overlay" onClick={() => setAiModalOpen(false)}>
            <motion.div 
              className="modal-content ai-modal-premium" 
              style={{ maxWidth: '540px', padding: '48px', borderRadius: '32px' }} 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className="ai-orb-container" style={{ marginBottom: '40px' }}>
                <div className="ai-orb" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}></div>
                <div className="ai-orb-ring" style={{ borderColor: 'var(--accent-primary)' }}></div>
                <div className="ai-orb-ring" style={{ borderColor: 'var(--accent-secondary)' }}></div>
              </div>
              
              <h2 className="modal-title" style={{ letterSpacing: '6px', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '900', textAlign: 'center' }}>NEURAL SYNC</h2>
              
              <div className="neural-sync-progress" style={{ margin: '24px 0', height: '2px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                {currentTip.includes('...') && (
                  <motion.div 
                    className="neural-sync-bar" 
                    initial={{ width: 0 }} 
                    animate={{ width: '100%' }} 
                    transition={{ duration: 2.5 }} 
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
                  />
                )}
              </div>
              
              <p className="typing-text" style={{ lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '40px', minHeight: '120px', fontWeight: '400', textAlign: 'center', color: 'var(--text-primary)' }}>
                {currentTip}
              </p>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button className="modal-close-btn premium" onClick={() => setAiModalOpen(false)} style={{ flex: 1, borderRadius: '16px' }}>Dismiss</button>
                {completedCount < totalCount && (
                  <button 
                    className="modal-close-btn premium highlighted" 
                    onClick={() => { setAiModalOpen(false); setIsZenMode(true); }}
                    style={{ flex: 1.5, borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                  >
                    <Zap size={18} /> Initiate Zen
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {settingsOpen && (
        <SettingsModal 
          onClose={() => setSettingsOpen(false)} 
          archivedHabits={archivedHabits}
          restoreHabit={restoreHabit}
          clearArchive={clearArchive}
        />
      )}
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
            transition={{ duration: 0.8 }}
            style={{ backdropFilter: 'blur(40px)', background: 'rgba(var(--bg-primary-rgb), 0.95)' }}
          >
            <div className="zen-bg-glow" style={{ background: 'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)' }}></div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="zen-mode-btn exit" 
              onClick={() => setIsZenMode(false)}
              style={{ position: 'absolute', top: '40px', right: '40px', background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '12px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}
            >
              <Minimize2 size={18} /> Exit Chamber
            </motion.button>

            <div className="zen-content">
              <motion.div 
                initial={{ y: 60, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.3, duration: 1, type: 'spring' }}
                style={{ width: '100%', maxWidth: '600px' }}
              >
                <div className="breathing-container" style={{ marginBottom: '64px', position: 'relative', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.8, 1],
                      opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="breathing-circle" 
                    style={{ position: 'absolute', border: '2px solid var(--accent-primary)', width: '200px', height: '200px', borderRadius: '50%' }}
                  />
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.5, 1],
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="breathing-circle-inner" 
                    style={{ position: 'absolute', background: 'var(--accent-primary)', opacity: 0.1, width: '150px', height: '150px', borderRadius: '50%' }}
                  />
                  <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <motion.p 
                      animate={{ 
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{ duration: 8, repeat: Infinity }}
                      className="breathing-label" 
                      style={{ fontSize: '0.9rem', letterSpacing: '8px', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: '900' }}
                    >
                      {timerIsActive ? 'Focus Your Spirit' : 'Sync Your Breath'}
                    </motion.p>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '24px', justifyContent: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', marginBottom: '4px' }}>MOMENTUM</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{momentumScore}</div>
                      </div>
                      <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', marginBottom: '4px' }}>COHERENCE</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-primary)' }}>{Math.round(productivityScore)}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="zen-title" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '8px', marginBottom: '48px' }}>ZEN MODE</h2>
                
                <div className="glass-panel" style={{ padding: '48px', borderRadius: '40px', background: 'var(--glass-bg)' }}>
                  <FocusTimer 
                    timeLeft={timerTimeLeft} 
                    setTimeLeft={setTimerTimeLeft} 
                    isActive={timerIsActive} 
                    setIsActive={setTimerIsActive} 
                    mode={timerMode} 
                    setMode={setTimerMode}
                    soundEnabled={timerSoundEnabled}
                    setSoundEnabled={setTimerSoundEnabled}
                    history={timerHistory}
                    setHistory={setTimerHistory}
                  />
                </div>

                <div className="zen-sounds-container" style={{ marginTop: '48px' }}>
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
            <motion.div 
              key={toast.id} 
              className="toast glass-panel" 
              initial={{ opacity: 0, x: 100, scale: 0.8, filter: 'blur(10px)' }} 
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }} 
              exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)', transition: { duration: 0.2 } }}
              style={{ borderRadius: '20px', borderLeft: '4px solid var(--accent-primary)' }}
            >
              <div className="toast-icon" style={{ fontSize: '1.5rem' }}>{toast.icon}</div>
              <div className="toast-content">
                <div className="toast-title" style={{ fontWeight: '800', fontSize: '0.95rem' }}>{toast.title}</div>
                <div className="toast-msg" style={{ fontSize: '0.85rem', opacity: 0.8 }}>{toast.message}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
