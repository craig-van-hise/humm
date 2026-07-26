import React from 'react';
import { BreathModeId, BreathMode, SequencePool } from '../types';
import { Activity, ShieldCheck, Zap, Music } from 'lucide-react';

interface SequenceSelectorProps {
  selectedBreathMode: BreathModeId;
  onSelectBreathMode: (mode: BreathMode) => void;
  selectedPoolId: string;
  onSelectSequencePool: (pool: SequencePool) => void;
}

export const BREATH_MODES: BreathMode[] = [
  {
    id: 'vagal',
    name: 'Vagal Calm',
    description: 'Extended exhalation (4s Inhale / 10s Hum / 4s Rest) for HRV boost.',
    inhaleSec: 4,
    humSec: 10,
    restSec: 4,
  },
  {
    id: 'focus',
    name: 'Focus / Theta',
    description: 'Shorter rhythm (3s Inhale / 6s Hum / 2s Rest) for mental clarity.',
    inhaleSec: 3,
    humSec: 6,
    restSec: 2,
  },
  {
    id: 'sinus_no',
    name: 'Sinus NO Recharge',
    description: 'Prolonged hums with 3-minute rest to replenish nitric oxide.',
    inhaleSec: 4,
    humSec: 10,
    restSec: 180, // 3 minute recharge phase
  },
];

export const SEQUENCE_POOLS: SequencePool[] = [
  {
    id: 'micro_tuning',
    name: 'Gentle Micro-Tuning',
    description: 'Minimal tension micro-interval warmups.',
    intervalOffsets: [0, 1, 0, 3, 0],
    intervalDegrees: ['1', 'b2', '1', 'b3', '1'],
  },
  {
    id: 'resonance_anchor',
    name: 'Resonance Anchor',
    description: 'Fifth interval harmonic stabilization.',
    intervalOffsets: [0, 7, 0],
    intervalDegrees: ['1', '5', '1'],
  },
  {
    id: 'triadic',
    name: 'Triadic Foundation',
    description: 'Step-wise resonance across register.',
    intervalOffsets: [0, 4, 7, 4, 0],
    intervalDegrees: ['1', '3', '5', '3', '1'],
  },
  {
    id: 'five_note',
    name: 'Five-Note Slide',
    description: 'Linear vocal connection & pitch continuity.',
    intervalOffsets: [0, 2, 4, 5, 7, 5, 4, 2, 0],
    intervalDegrees: ['1', '2', '3', '4', '5', '4', '3', '2', '1'],
  },
];

export const SequenceSelector: React.FC<SequenceSelectorProps> = ({
  selectedBreathMode,
  onSelectBreathMode,
  selectedPoolId,
  onSelectSequencePool,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto my-3 space-y-4">
      {/* Breath Pacing Presets */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          Breath Pacing Protocol
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {BREATH_MODES.map((mode) => {
            const isSelected = selectedBreathMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => onSelectBreathMode(mode)}
                className={`p-2.5 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-500/20 to-slate-900 border-cyan-400 text-white shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{mode.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {mode.inhaleSec}s / {mode.humSec}s / {mode.restSec}s
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note Sequence Pools */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Music className="w-4 h-4 text-emerald-400" />
          Melodic Sequence Preset
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {SEQUENCE_POOLS.map((pool) => {
            const isSelected = selectedPoolId === pool.id;

            return (
              <button
                key={pool.id}
                onClick={() => onSelectSequencePool(pool)}
                className={`p-2.5 rounded-xl text-left transition-all duration-200 border ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-500/20 to-slate-900 border-emerald-400 text-white shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold block mb-1">{pool.name}</span>
                <div className="flex flex-wrap gap-1">
                  {pool.intervalDegrees.map((deg, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 border border-slate-700 text-emerald-300"
                    >
                      {deg}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
