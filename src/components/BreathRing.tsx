import React from 'react';
import { motion } from 'framer-motion';

export interface BreathRingProps {
  isActive: boolean;
  onToggleSession: () => void;
  rootNote: string;
  activePhase: 'inhale' | 'humming' | 'resting' | 'ready' | 'idle';
  phaseDuration: number;
  activeNoteName: string | null;
  activeDegree: string | null;
  pitchDurationSec?: number; // Exact duration of current guide note pitch
  pitchStepIndex?: number;    // Triggers smooth animation reset per pitch
}

const RADIUS = 105;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const BreathRing: React.FC<BreathRingProps> = ({
  isActive,
  onToggleSession,
  rootNote,
  activePhase,
  phaseDuration,
  activeNoteName,
  activeDegree,
  pitchDurationSec = 2.0,
  pitchStepIndex = 0,
}) => {
  const isHumming = activePhase === 'humming';

  return (
    <div className="flex flex-col items-center justify-center my-4 select-none">
      <button
        onClick={onToggleSession}
        aria-label={isActive ? "Pause Session" : "Start Session"}
        className="group relative flex items-center justify-center rounded-full p-2 focus:outline-none transition-transform active:scale-95 cursor-pointer"
      >
        <svg className="w-72 h-72 -rotate-90 transform" viewBox="0 0 256 256">
          {/* Base Background Track */}
          <circle
            cx="128"
            cy="128"
            r={RADIUS}
            className="stroke-slate-800"
            strokeWidth="6"
            fill="none"
          />

          {/* Phase Progress Ring (Inhale / Rest) */}
          {!isHumming && (
            <motion.circle
              cx="128"
              cy="128"
              r={RADIUS}
              className={
                activePhase === 'inhale' ? 'stroke-sky-400' : 'stroke-slate-600'
              }
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: isActive ? 0 : CIRCUMFERENCE }}
              transition={{
                key: `phase-${activePhase}`,
                duration: isActive ? phaseDuration : 0.4,
                ease: "linear",
              }}
            />
          )}

          {/* Dedicated Pitch Timing Ring (Humming / Melody Phase) */}
          {isHumming && (
            <motion.circle
              key={`pitch-${pitchStepIndex}`}
              cx="128"
              cy="128"
              r={RADIUS}
              className="stroke-amber-400"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: 0 }}
              transition={{
                duration: pitchDurationSec,
                ease: "linear", // Fluid, non-stepping 60fps pitch progress
              }}
            />
          )}
        </svg>

        {/* Center Pitch & Status Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-[10px] tracking-widest font-bold uppercase ${
            isHumming ? 'text-amber-400' : 'text-cyan-400'
          }`}>
            {isActive ? activePhase : "TAP TO BEGIN"}
          </span>

          <div className="text-4xl font-extrabold text-white my-1">
            {isActive && activeNoteName ? activeNoteName : rootNote}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            {isActive && activeDegree
              ? `Degree: [ ${activeDegree} ]`
              : "Fundamental Pitch"}
          </span>
        </div>
      </button>
    </div>
  );
};
