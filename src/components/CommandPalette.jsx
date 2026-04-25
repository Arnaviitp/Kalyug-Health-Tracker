import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Moon, Sun, Monitor, Trophy, Settings, Play, Plus, Zap, Shield } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, actions }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commandList = [
    { id: 'scroll-habits', label: 'Go to Daily Actions', icon: <Plus size={18} />, action: () => actions.scrollToSection('habits-section'), category: 'Navigation' },
    { id: 'scroll-insights', label: 'Go to Insights', icon: <Zap size={18} />, action: () => actions.scrollToSection('insights-section'), category: 'Navigation' },
    { id: 'scroll-journal', label: 'Go to Daily Journal', icon: <Moon size={18} />, action: () => actions.scrollToSection('journal-section'), category: 'Navigation' },
    { id: 'scroll-focus', label: 'Go to Focus Timer', icon: <Play size={18} />, action: () => actions.scrollToSection('focus-section'), category: 'Navigation' },
    { id: 'theme-dark', label: 'Switch to Dark Mode', icon: <Moon size={18} />, action: () => actions.setTheme('dark'), category: 'Appearance' },
    { id: 'theme-light', label: 'Switch to Light Mode', icon: <Sun size={18} />, action: () => actions.setTheme('light'), category: 'Appearance' },
    { id: 'theme-oled', label: 'Switch to OLED Mode', icon: <Monitor size={18} />, action: () => actions.setTheme('oled'), category: 'Appearance' },
    { id: 'open-achievements', label: 'View Achievements', icon: <Trophy size={18} />, action: () => actions.openAchievements(), category: 'General' },
    { id: 'open-settings', label: 'Open Settings', icon: <Settings size={18} />, action: () => actions.openSettings(), category: 'General' },
    { id: 'toggle-recovery', label: 'Toggle Recovery Mode', icon: <Shield size={18} />, action: () => actions.toggleRecovery(), category: 'System' },
    { id: 'toggle-zen', label: 'Toggle Zen Mode', icon: <Zap size={18} />, action: () => actions.toggleZen(), category: 'System' },
    { id: 'ai-insight', label: 'Get Neural Prophecy', icon: <Zap size={18} />, action: () => actions.getAiInsight(), category: 'System' },
  ];

  const filteredCommands = commandList.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="command-palette-overlay" onClick={onClose}>
          <motion.div 
            className="command-palette-content"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="command-input-wrapper">
              <Search size={20} className="search-icon" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Type a command or search..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="command-input"
              />
              <div className="command-kb-hint">
                <Command size={12} /> K
              </div>
            </div>

            <div className="command-results">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, index) => (
                  <div 
                    key={cmd.id}
                    className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="command-icon">{cmd.icon}</div>
                    <div className="command-info">
                      <span className="command-label">{cmd.label}</span>
                      <span className="command-category">{cmd.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">No commands found for "{query}"</div>
              )}
            </div>
            
            <div className="command-footer">
              <span>Navigate with <kbd>↑↓</kbd></span>
              <span>Select with <kbd>Enter</kbd></span>
              <span>Close with <kbd>Esc</kbd></span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
