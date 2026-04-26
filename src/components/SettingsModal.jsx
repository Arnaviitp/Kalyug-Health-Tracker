import { Download, Upload, Trash2, X, Archive, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsModal({ onClose, archivedHabits = [], restoreHabit, clearArchive }) {
  const exportData = () => {
    const data = {
      habits: localStorage.getItem('k-habits-v2'),
      archivedHabits: localStorage.getItem('k-archived-habits'),
      logs: localStorage.getItem('k-dailylogs'),
      moods: localStorage.getItem('k-moods'),
      journal: localStorage.getItem('k-journal'),
      theme: localStorage.getItem('k-theme'),
      achievements: localStorage.getItem('k-unlocked-achievements'),
      quest: localStorage.getItem('k-daily-quest')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitarc-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.habits) localStorage.setItem('k-habits-v2', data.habits);
        if (data.archivedHabits) localStorage.setItem('k-archived-habits', data.archivedHabits);
        if (data.logs) localStorage.setItem('k-dailylogs', data.logs);
        if (data.moods) localStorage.setItem('k-moods', data.moods);
        if (data.journal) localStorage.setItem('k-journal', data.journal);
        if (data.theme) localStorage.setItem('k-theme', data.theme);
        if (data.achievements) localStorage.setItem('k-unlocked-achievements', data.achievements);
        if (data.quest) localStorage.setItem('k-daily-quest', data.quest);
        window.location.reload();
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const hardReset = () => {
    if (window.confirm("Are you sure? This will delete ALL habits, logs, and journals. This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ 
      backdropFilter: 'blur(15px)', 
      zIndex: 10000, 
      display: 'flex', 
      alignItems: 'flex-start', 
      justifyContent: 'center', 
      overflowY: 'auto', 
      padding: '40px 20px',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.4)'
    }}>
      <motion.div 
        className="modal-content glass-panel" 
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ 
          maxWidth: '600px', 
          width: '100%', 
          padding: '40px', 
          borderRadius: '32px',
          position: 'relative',
          marginTop: '20px',
          marginBottom: '20px'
        }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 className="modal-title" style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>System Configuration</h2>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="settings-section">
            <h3 style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={14} /> Data Core
            </h3>
            <div className="settings-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="tactile-btn" onClick={exportData} style={{ padding: '12px 20px', borderRadius: '16px', fontSize: '0.85rem', background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: '700', transition: 'all 0.2s ease' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><Download size={16} /> Export Backup</span>
              </button>
              
              <label className="tactile-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 20px', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer', background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: '700', transition: 'all 0.2s ease' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Upload size={16} /> Import Backup</span>
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
              </label>
            </div>
            <button 
              className="tactile-btn" 
              style={{ marginTop: '12px', width: '100%', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '16px', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.05)' }} 
              onClick={hardReset}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><Trash2 size={16} /> Wipe All Neural Data</span>
            </button>
          </div>

          <div className="archive-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Archive size={14} /> Neural Archive
              </h3>
              {archivedHabits.length > 0 && (
                <button onClick={clearArchive} style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', fontWeight: '800', cursor: 'pointer', padding: '4px 10px', borderRadius: '100px' }}>PURGE ARCHIVE</button>
              )}
            </div>
            
            <div className="archive-list" style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              {archivedHabits.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', opacity: 0.5 }}>
                  <Archive size={20} style={{ marginBottom: '8px', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.8rem' }}>No archived memory fragments.</p>
                </div>
              ) : (
                archivedHabits.map(habit => (
                  <div key={habit.id} className="archived-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '14px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.5 }}></div>
                    <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: '600', opacity: 0.9 }}>{habit.text}</span>
                    <button 
                      onClick={() => restoreHabit(habit.id)}
                      style={{ background: 'var(--accent-glow)', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                      title="Restore Habit"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button className="tactile-btn premium" onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: '18px', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontWeight: '800', border: 'none' }}>
            Acknowledge Changes
          </button>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.5, letterSpacing: '1px' }}>
            HABITARC OS v2.5.0 // NEURAL-LINK ENCRYPTED
          </div>
        </div>
      </motion.div>
    </div>
  );
}
