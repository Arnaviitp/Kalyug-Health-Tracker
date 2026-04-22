import { useState, useRef, useEffect } from 'react';
import { CloudRain, Wind, Waves, Disc } from 'lucide-react';

export default function AmbientSounds() {
  const [playing, setPlaying] = useState(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);

  const stopSound = () => {
    if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    setPlaying(null);
  };

  const playBrownNoise = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    stopSound();
    
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate for gain
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.5;
    
    // Add lowpass filter for deep wind/noise
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start();
    sourceRef.current = noiseSource;
    gainRef.current = gainNode;
    setPlaying('noise');
  };

  const playRainNoise = () => {
   if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    stopSound();
    
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.1;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; // Rain is slightly higher frequency

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start();
    sourceRef.current = noiseSource;
    gainRef.current = gainNode;
    setPlaying('rain');
  };

  const playWavesNoise = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    stopSound();
    
    const bufferSize = ctx.sampleRate * 5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; 
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    const gainNode = ctx.createGain();
    
    const modOsc = ctx.createOscillator();
    modOsc.type = 'sine';
    modOsc.frequency.value = 0.1; 
    
    const modGain = ctx.createGain();
    modGain.gain.value = 0.4;
    
    modOsc.connect(modGain);
    modGain.connect(gainNode.gain);
    
    gainNode.gain.value = 0.5;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; 

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start();
    modOsc.start();
    
    sourceRef.current = {
      stop: () => { noiseSource.stop(); modOsc.stop(); },
      disconnect: () => { noiseSource.disconnect(); modOsc.disconnect(); }
    };
    gainRef.current = gainNode;
    setPlaying('waves');
  };

  const toggleSound = (sound) => {
    if (playing === sound) {
      stopSound();
    } else {
      if (sound === 'noise') playBrownNoise();
      else if (sound === 'rain') playRainNoise();
      else if (sound === 'waves') playWavesNoise();
    }
  };

  useEffect(() => {
    return () => {
        if (sourceRef.current) sourceRef.current.stop();
        if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="ambient-sounds">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        <Disc size={18} className={playing ? 'spin-icon' : ''} style={{ color: playing ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
        <h3 style={{ fontSize: '1.2rem', textAlign: 'center', color: 'var(--text-primary)' }}>Focus Scape</h3>
      </div>
      
      <div className="sound-toggles">
        <button 
          className={`sound-btn ${playing === 'rain' ? 'active' : ''}`}
          onClick={() => toggleSound('rain')}
          title="Lo-Fi Rain"
        >
          <CloudRain size={24} />
        </button>
        <button 
          className={`sound-btn ${playing === 'noise' ? 'active' : ''}`}
          onClick={() => toggleSound('noise')}
          title="Deep Noise"
        >
          <Wind size={24} />
        </button>
        <button 
          className={`sound-btn ${playing === 'waves' ? 'active' : ''}`}
          onClick={() => toggleSound('waves')}
          title="Ocean Waves"
        >
          <Waves size={24} />
        </button>
      </div>
    </div>
  );
}
