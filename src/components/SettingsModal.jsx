import { Download, Upload, Trash2, X } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  const exportData = () => {
    const data = {
      habits: localStorage.getItem('k-habits-v2'),
      logs: localStorage.getItem('k-dailylogs'),
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
        if (data.logs) localStorage.setItem('k-dailylogs', data.logs);
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        <h2 className="modal-title">Settings & Data</h2>
        
        <div className="settings-actions" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          <button className="tactile-btn" onClick={exportData}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={18} /> Export Backup JSON</span>
          </button>
          
          <label className="tactile-btn" style={{ justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Upload size={18} /> Import Backup</span>
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
          </label>

          <button className="tactile-btn" style={{ borderColor: 'var(--recovery-text)', color: 'var(--recovery-text)' }} onClick={hardReset}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trash2 size={18} /> Hard Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
