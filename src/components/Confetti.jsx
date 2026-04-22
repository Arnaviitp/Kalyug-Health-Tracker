import { motion } from 'framer-motion';

export default function Confetti() {
  const particles = Array.from({ length: 40 });
  
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: '50vw', 
            y: '100vh', 
            scale: Math.random() * 0.5 + 0.5,
            rotate: 0,
            opacity: 1 
          }}
          animate={{ 
            x: `${Math.random() * 100}vw`, 
            y: `${Math.random() * -100}vh`,
            rotate: Math.random() * 360,
            opacity: 0
          }}
          transition={{ 
            duration: Math.random() * 2 + 1, 
            ease: "easeOut" 
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
