import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionState } from '../types';
import { Wind, Volume2, Moon } from 'lucide-react';

interface BreathRingProps {
  sessionState: SessionState;
  activeNote: string | null;
  activeDegree: string | null;
  rootNote: string;
  progressPercent: number; // 0 to 100 for active phase
  phaseRemainingSec: number;
}

export const BreathRing: React.FC<BreathRingProps> = ({
  sessionState,
  activeNote,
  activeDegree,
  rootNote,
  progressPercent,
  phaseRemainingSec,
}) => {

  const getPhaseText = () => {
    switch (sessionState) {
      case 'inhale':
        return 'INHALE GENTLY';
      case 'humming':
        return 'HUM WITH RESONANCE';
      case 'resting':
        return 'REST & RECHARGE';
      default:
        return 'READY TO BEGIN';
    }
  };

  const getPhaseColor = () => {
    switch (sessionState) {
      case 'inhale':
        return 'from-sky-500/30 via-cyan-500/20 to-transparent border-sky-400';
      case 'humming':
        return 'from-emerald-500/40 via-cyan-500/30 to-teal-500/10 border-emerald-400';
      case 'resting':
        return 'from-indigo-500/20 via-slate-800/20 to-transparent border-slate-600';
      default:
        return 'from-cyan-500/20 via-slate-800/10 to-transparent border-cyan-500/50';
    }
  };

  // Scale variants for the expanding/contracting breath ring
  const ringVariants = {
    idle: { scale: 1, opacity: 0.8 },
    inhale: { scale: 1.28, transition: { duration: 0.4, ease: 'easeOut' } },
    humming: { scale: 1.2, transition: { duration: 0.3 } },
    resting: { scale: 0.92, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-6 py-4">
      {/* Outer Pulse Glow (Humming Phase 60 FPS vibration animation) */}
      {sessionState === 'humming' && (
        <motion.div
          animate={{
            scale: [1.18, 1.26, 1.18],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-teal-500/20 blur-2xl pointer-events-none"
        />
      )}

      {/* Main Animated Breath Ring Container */}
      <motion.div
        variants={ringVariants}
        animate={sessionState}
        className={`relative w-60 h-60 sm:w-68 sm:h-68 rounded-full flex flex-col items-center justify-center border-2 bg-gradient-to-b ${getPhaseColor()} shadow-2xl backdrop-blur-md transition-colors duration-500`}
      >
        {/* Progress Ring Overlay (SVG circle stroke) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            className="stroke-slate-800/40 fill-none"
            strokeWidth="3"
          />
          {sessionState !== 'idle' && (
            <circle
              cx="50"
              cy="50"
              r="46"
              className={`fill-none transition-all duration-200 ${
                sessionState === 'humming'
                  ? 'stroke-emerald-400'
                  : sessionState === 'inhale'
                  ? 'stroke-cyan-400'
                  : 'stroke-slate-500'
              }`}
              strokeWidth="3.5"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * progressPercent) / 100}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Inner Content */}
        <div className="z-10 flex flex-col items-center text-center p-4">
          {/* Icon Indicator */}
          <div className="mb-2">
            {sessionState === 'inhale' && <Wind className="w-7 h-7 text-sky-400 animate-bounce" />}
            {sessionState === 'humming' && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Volume2 className="w-8 h-8 text-emerald-400" />
              </motion.div>
            )}
            {sessionState === 'resting' && <Moon className="w-7 h-7 text-indigo-300" />}
            {sessionState === 'idle' && (
              <span className="inline-block w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>

          {/* Phase Title */}
          <span className="text-xs uppercase tracking-widest font-semibold text-slate-300 mb-1">
            {getPhaseText()}
          </span>

          {/* Active Note & Degree Display */}
          <AnimatePresence mode="wait">
            {sessionState === 'humming' && activeNote ? (
              <motion.div
                key={activeNote}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center mt-1"
              >
                <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                  {activeNote}
                </span>
                {activeDegree && (
                  <span className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Degree [{activeDegree}]
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="timer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center mt-1"
              >
                <span className="text-3xl font-bold text-slate-200">
                  {sessionState !== 'idle' ? `${phaseRemainingSec}s` : rootNote}
                </span>
                {sessionState === 'idle' && (
                  <span className="text-xs text-slate-400 mt-1">Fundamental Pitch</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
