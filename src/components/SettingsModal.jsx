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
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', zIndex: 1000 }}>
      <motion.div 
        className="modal-content glass-panel" 
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ maxWidth: '600px', width: '90%', padding: '40px', borderRadius: '32px' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        <h2 className="modal-title" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '32px' }}>System Configuration</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div className="settings-section">
            <h3 style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-primary)', marginBottom: '20px' }}>Data Core</h3>
            <div className="settings-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="tactile-btn" onClick={exportData} style={{ padding: '12px', borderRadius: '14px', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={18} /> Export Backup</span>
              </button>
              
              <label className="tactile-btn" style={{ justifyContent: 'center', padding: '12px', borderRadius: '14px', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Upload size={18} /> Import Backup</span>
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
              </label>

              <button className="tactile-btn" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '12px', borderRadius: '14px', fontSize: '0.9rem' }} onClick={hardReset}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trash2 size={18} /> Wipe System Data</span>
              </button>
            </div>
          </div>

          <div className="archive-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Neural Archive</h3>
              {archivedHabits.length > 0 && (
                <button onClick={clearArchive} style={{ fontSize: '0.7rem', color: '#ef4444', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>CLEAR ALL</button>
              )}
            </div>
            
            <div className="archive-list" style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '8px' }}>
              {archivedHabits.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, border: '1px dashed var(--glass-border)', borderRadius: '16px' }}>
                  <Archive size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.8rem' }}>No archived habits.</p>
                </div>
              ) : (
                archivedHabits.map(habit => (
                  <div key={habit.id} className="archived-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                    <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: '500', opacity: 0.8 }}>{habit.text}</span>
                    <button 
                      onClick={() => restoreHabit(habit.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Restore"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="footer-note" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
          HabitArc OS v2.4.1 | Neural-Link Stable
        </div>
      </motion.div>
    </div>
  );
}
