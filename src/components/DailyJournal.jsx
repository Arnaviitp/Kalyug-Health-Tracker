import { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, MicOff, Sparkles, AlertCircle, Smile, Meh, Frown, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOODS = [
  { id: 'great', emoji: '🤩', icon: <Heart size={16} />, color: '#10b981', label: 'Great' },
  { id: 'good', emoji: '😊', icon: <Smile size={16} />, color: '#6366f1', label: 'Good' },
  { id: 'neutral', emoji: '😐', icon: <Meh size={16} />, color: '#94a3b8', label: 'Neutral' },
  { id: 'tired', emoji: '😴', icon: <Zap size={16} />, color: '#f59e0b', label: 'Tired' },
  { id: 'bad', emoji: '😔', icon: <Frown size={16} />, color: '#ef4444', label: 'Bad' },
];

export default function DailyJournal({ todayStr }) {
  const [journalText, setJournalText] = useState(() => {
    const saved = localStorage.getItem('k-journal');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed[todayStr] || '';
    }
    return '';
  });

  const [mood, setMood] = useState(() => {
    const saved = localStorage.getItem('k-moods');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed[todayStr] || null;
    }
    return null;
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const savedJ = JSON.parse(localStorage.getItem('k-journal') || '{}');
    const savedM = JSON.parse(localStorage.getItem('k-moods') || '{}');
    setJournalText(savedJ[todayStr] || '');
    setMood(savedM[todayStr] || null);
    setError(null);
  }, [todayStr]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = (textareaRef.current.scrollHeight + 2) + 'px';
    }
    
    const timer = setTimeout(() => {
      if (journalText !== undefined) {
        const savedJ = JSON.parse(localStorage.getItem('k-journal') || '{}');
        savedJ[todayStr] = journalText;
        localStorage.setItem('k-journal', JSON.stringify(savedJ));
        
        const savedM = JSON.parse(localStorage.getItem('k-moods') || '{}');
        savedM[todayStr] = mood;
        localStorage.setItem('k-moods', JSON.stringify(savedM));
        
        setSaveStatus('Saved.');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [journalText, mood, todayStr]);

  const sentiment = useMemo(() => {
    if (!journalText) return { score: 0, color: 'var(--glass-border)' };
    const positive = ['good', 'great', 'happy', 'grateful', 'win', 'success', 'amazing', 'love', 'done', 'perfect'];
    const negative = ['bad', 'sad', 'tired', 'failed', 'hard', 'stuck', 'stress', 'angry', 'slow', 'missed'];
    
    const words = journalText.toLowerCase().split(/\s+/);
    let score = 0;
    words.forEach(w => {
      if (positive.includes(w)) score += 1;
      if (negative.includes(w)) score -= 1;
    });
    
    const normalized = Math.max(-2, Math.min(2, score));
    const colors = {
      '-2': '#ef4444',
      '-1': '#f59e0b',
      '0': 'var(--accent-primary)',
      '1': '#6366f1',
      '2': '#10b981'
    };
    return { score: normalized, color: colors[normalized.toString()] };
  }, [journalText]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            setJournalText(prev => prev + (prev ? ' ' : '') + transcript);
            setInterimText('');
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInterimText(interimTranscript);
      };

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText('');
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsRecording(false);
        setInterimText('');
        
        if (event.error === 'not-allowed') {
          setError("Microphone access denied. Please check your browser settings.");
        } else if (event.error === 'no-speech') {
          setError("No speech detected. Try again?");
        } else if (event.error === 'network') {
          setError("Network error. Speech recognition requires an internet connection.");
        } else {
          setError(`Error: ${event.error}`);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setError("Failed to initialize microphone.");
      setIsRecording(false);
    }
  };

  return (
    <div className="daily-journal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Neural Reflection</h3>
          <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: '0.7rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '150px' }}
              >
                <AlertCircle size={12} /> {error}
              </motion.div>
            )}
          </AnimatePresence>
          <span style={{ fontSize: '0.7rem', color: 'var(--success-color)', minWidth: '50px', textAlign: 'right', fontWeight: '800', textTransform: 'uppercase' }}>
            {saveStatus}
          </span>
          <button 
            className={`voice-record-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            title={isRecording ? "Stop Recording" : "Start Voice Reflection"}
            style={{ width: '40px', height: '40px', borderRadius: '12px' }}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>

      <div className="mood-selector" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {MOODS.map(m => (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: '16px',
              border: mood === m.id ? `2px solid ${m.color}` : '1px solid var(--glass-border)',
              background: mood === m.id ? `${m.color}15` : 'rgba(var(--bg-primary-rgb), 0.3)',
              color: mood === m.id ? m.color : 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
            <span style={{ fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</span>
          </button>
        ))}
      </div>

      <div className="journal-wrapper" style={{ position: 'relative' }}>
        <textarea 
          ref={textareaRef}
          className="journal-textarea"
          placeholder="Sync your neural states... What insights were gained today?"
          value={journalText + (interimText ? (journalText ? ' ' : '') + interimText : '')}
          readOnly={isRecording}
          onChange={(e) => {
            if (!isRecording) {
              setJournalText(e.target.value);
              setSaveStatus('Saving...');
            }
          }}
          style={{ minHeight: '120px', padding: '20px', borderRadius: '24px', background: 'rgba(var(--bg-primary-rgb), 0.2)', border: '1px solid var(--glass-border)', fontSize: '1.05rem', lineHeight: '1.6' }}
        />
        {isRecording && (
          <div className="recording-status">
            <div className="voice-waves">
              <span></span><span></span><span></span><span></span>
            </div>
            Neural Link Active...
          </div>
        )}
        
        <div 
          className="sentiment-bar" 
          style={{ 
            height: '4px', 
            background: 'rgba(0,0,0,0.05)', 
            marginTop: '12px', 
            borderRadius: '2px', 
            overflow: 'hidden',
            display: 'flex'
          }}
        >
          <motion.div 
            animate={{ width: `${(sentiment.score + 2) * 25}%`, background: sentiment.color }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ height: '100%' }}
          />
        </div>
      </div>
      
      {isRecording && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="interim-hint"
          style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '500', fontStyle: 'italic' }}
        >
          {interimText || "Transcribing neural input..."}
        </motion.div>
      )}
    </div>
  );
}
