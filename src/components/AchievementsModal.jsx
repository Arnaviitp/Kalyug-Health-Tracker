import { Trophy, X } from 'lucide-react';

export default function AchievementsModal({ onClose, totalXP, streaks }) {
  const achievementsList = [
    { id: 1, title: 'First Steps', desc: 'Earn your first XP.', condition: totalXP > 0 },
    { id: 2, title: 'Consistency', desc: 'Reach a 3-day streak.', condition: streaks.longestStreak >= 3 },
    { id: 3, title: 'Unstoppable', desc: 'Reach a 7-day streak.', condition: streaks.longestStreak >= 7 },
    { id: 4, title: 'Centurion', desc: 'Collect 100 XP.', condition: totalXP >= 100 },
    { id: 5, title: 'Mastery', desc: 'Collect 1000 XP.', condition: totalXP >= 1000 },
  ];

  const unlockedCount = achievementsList.filter(a => a.condition).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <Trophy size={32} color="#f59e0b" />
          <h2 className="modal-title" style={{ margin: 0 }}>Trophy Room</h2>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Unlocked: {unlockedCount} / {achievementsList.length}
        </p>

        <div className="achievements-grid">
          {achievementsList.map(a => (
            <div key={a.id} className={`achievement-card ${a.condition ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">
                {a.condition ? '🏆' : '🔒'}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: a.condition ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{a.title}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
