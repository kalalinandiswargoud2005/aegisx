import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Terminal } from 'lucide-react';
import { Button } from '@/components/ui';

export function Landing() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnter = () => {
    navigate('/dashboard'); 
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020204] overflow-hidden flex flex-col items-center justify-center font-rajdhani">
      {/* Background Interactive Glow */}
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[100px] bg-primary"
        animate={{
          x: mousePosition.x - 300,
          y: mousePosition.y - 300,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
      />
      
      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 relative">
             <ShieldAlert size={100} className="text-primary text-glow drop-shadow-[0_0_25px_rgba(5,217,232,0.8)]" />
             <motion.div
               animate={{ opacity: [0, 1, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
             />
          </div>

          <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary tracking-[0.2em] uppercase mb-4" style={{ WebkitTextStroke: '2px rgba(5,217,232,0.5)', textShadow: '0 0 20px rgba(5,217,232,0.4)' }}>
            ASTRA
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xl md:text-2xl text-primary/80 font-mono tracking-widest mb-16 uppercase flex items-center gap-3"
          >
            <span className="text-secondary animate-pulse">{'>'}</span> 
            Vigilance Beyond Boundaries
            <span className="text-secondary animate-pulse">_</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <Button 
              size="lg" 
              onClick={handleEnter}
              className="text-lg px-12 py-6 bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-[#020204] shadow-[0_0_30px_rgba(5,217,232,0.3)] hover:shadow-[0_0_50px_rgba(5,217,232,0.8)] transition-all duration-300 group relative overflow-hidden cyber-cut"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              <Terminal size={24} className="mr-3" />
              INITIALIZE SYSTEM
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Footer text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 text-white/30 font-mono text-sm flex gap-4"
      >
        <span>v2.0.4-CYBER</span>
        <span>|</span>
        <span className="animate-pulse">SECURE CONNECTION ESTABLISHED</span>
      </motion.div>
    </div>
  );
}
