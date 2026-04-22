import { useState, useEffect, useRef } from 'react';

export default function DailyJournal({ todayStr }) {
  const [journalText, setJournalText] = useState(() => {
    const saved = localStorage.getItem('k-journal');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed[todayStr] || '';
    }
    return '';
  });

  const [saveStatus, setSaveStatus] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('k-journal');
    if (saved) {
      const parsed = JSON.parse(saved);
      setJournalText(parsed[todayStr] || '');
    } else {
      setJournalText('');
    }
  }, [todayStr]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = (textareaRef.current.scrollHeight + 2) + 'px';
    }
    
    const timer = setTimeout(() => {
      if (journalText !== undefined) {
        const saved = JSON.parse(localStorage.getItem('k-journal') || '{}');
        saved[todayStr] = journalText;
        localStorage.setItem('k-journal', JSON.stringify(saved));
        setSaveStatus('Saved.');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [journalText, todayStr]);

  return (
    <div className="daily-journal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Daily Reflection</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', minWidth: '50px', textAlign: 'right' }}>
          {saveStatus}
        </span>
      </div>
      <textarea 
        ref={textareaRef}
        className="journal-textarea"
        placeholder="What did you learn today? What are you grateful for?"
        value={journalText}
        onChange={(e) => {
          setJournalText(e.target.value);
          setSaveStatus('Saving...');
        }}
      />
    </div>
  );
}
