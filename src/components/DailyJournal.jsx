import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('k-journal');
    if (saved) {
      const parsed = JSON.parse(saved);
      setJournalText(parsed[todayStr] || '');
    } else {
      setJournalText('');
    }
    setError(null);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Daily Reflection</h3>
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
          <span style={{ fontSize: '0.75rem', color: 'var(--success-color)', minWidth: '50px', textAlign: 'right', fontWeight: '500' }}>
            {saveStatus}
          </span>
          <button 
            className={`voice-record-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            title={isRecording ? "Stop Recording" : "Start Voice Reflection"}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            <AnimatePresence>
              {isRecording && (
                <motion.span 
                  className="recording-pulse"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0.5 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
      <div className="journal-wrapper">
        <textarea 
          ref={textareaRef}
          className="journal-textarea"
          placeholder="What did you learn today? What are you grateful for? (Try voice reflection!)"
          value={journalText + (interimText ? (journalText ? ' ' : '') + interimText : '')}
          readOnly={isRecording}
          onChange={(e) => {
            if (!isRecording) {
              setJournalText(e.target.value);
              setSaveStatus('Saving...');
            }
          }}
        />
        {isRecording && (
          <div className="recording-status">
            <div className="voice-waves">
              <span></span><span></span><span></span><span></span>
            </div>
            Listening...
          </div>
        )}
      </div>
      {isRecording && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="interim-hint"
        >
          {interimText || "Speak now..."}
        </motion.div>
      )}
    </div>
  );
}
