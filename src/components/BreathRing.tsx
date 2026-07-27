import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionState } from '../types';
import { Wind, Volume2, Moon, Play } from 'lucide-react';

interface BreathRingProps {
  isSessionActive: boolean;
  onToggleSession: () => void;
  sessionState: SessionState;
  activeNote: string | null;
  activeDegree: string | null;
  rootNote: string;
  progressPercent: number;
  phaseRemainingSec: number;
}

export const BreathRing: React.FC<BreathRingProps> = ({
  isSessionActive,
  onToggleSession,
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
        return 'TAP CIRCLE TO START';
    }
  };

  const getPhaseColor = () => {
    if (!isSessionActive) {
      return 'from-cyan-500/20 via-slate-900/40 to-slate-950 border-slate-700 hover:border-cyan-500/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]';
    }
    switch (sessionState) {
      case 'inhale':
        return 'from-sky-500/30 via-cyan-500/20 to-slate-950 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.4)]';
      case 'humming':
        return 'from-emerald-500/40 via-cyan-500/30 to-slate-950 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]';
      case 'resting':
        return 'from-indigo-500/20 via-slate-800/30 to-slate-950 border-slate-600 shadow-[0_0_20px_rgba(99,102,241,0.2)]';
      default:
        return 'from-cyan-500/20 via-slate-900/40 to-slate-950 border-cyan-500/60';
    }
  };

  const ringVariants = {
    idle: { scale: 1, opacity: 0.9 },
    inhale: { scale: 1.25, transition: { duration: 0.4, ease: 'easeOut' } },
    humming: { scale: 1.18, transition: { duration: 0.3 } },
    resting: { scale: 0.92, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <div className="flex flex-col items-center justify-center my-4 py-2">
      <button
        onClick={onToggleSession}
        aria-label={isSessionActive ? "Pause Session" : "Start Session"}
        className="group relative flex flex-col items-center justify-center rounded-full p-2 transition-transform active:scale-95 focus:outline-none cursor-pointer"
      >
        {/* Animated outer glow during humming */}
        {isSessionActive && sessionState === 'humming' && (
          <motion.div
            animate={{
              scale: [1.15, 1.25, 1.15],
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

        {/* Main Breath Ring Circle */}
        <motion.div
          variants={ringVariants}
          animate={isSessionActive ? sessionState : 'idle'}
          className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center border-4 bg-gradient-to-b ${getPhaseColor()} backdrop-blur-md transition-all duration-500`}
        >
          {/* Progress Ring Stroke SVG */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              className="stroke-slate-800/40 fill-none"
              strokeWidth="3"
            />
            {isSessionActive && (
              <circle
                cx="50"
                cy="50"
                r="46"
                className={`fill-none transition-all duration-200 ${
                  sessionState === 'humming'
                    ? 'stroke-emerald-400'
                    : sessionState === 'inhale'
                    ? 'stroke-cyan-400'
                    : 'stroke-indigo-400'
                }`}
                strokeWidth="3.5"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * progressPercent) / 100}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Inner Content */}
          <div className="z-10 flex flex-col items-center text-center p-4 select-none">
            {/* Status / Action Indicator */}
            <div className="mb-2">
              {!isSessionActive ? (
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-300">
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>
              ) : sessionState === 'inhale' ? (
                <Wind className="w-8 h-8 text-sky-400 animate-bounce" />
              ) : sessionState === 'humming' ? (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Volume2 className="w-8 h-8 text-emerald-400" />
                </motion.div>
              ) : (
                <Moon className="w-8 h-8 text-indigo-300" />
              )}
            </div>

            {/* Status Title */}
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-1">
              {getPhaseText()}
            </span>

            {/* Note & Pitch Display */}
            <AnimatePresence mode="wait">
              {isSessionActive && sessionState === 'humming' && activeNote ? (
                <motion.div
                  key={activeNote}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col items-center mt-1"
                >
                  <span className="text-4xl font-extrabold text-white drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]">
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
                  key="timer-or-root"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center mt-1"
                >
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {isSessionActive ? `${phaseRemainingSec}s` : rootNote}
                  </span>
                  <span className="text-xs text-slate-400 font-medium mt-1">
                    {isSessionActive ? 'Humming Session Active' : 'Fundamental Pitch'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </button>
    </div>
  );
};
