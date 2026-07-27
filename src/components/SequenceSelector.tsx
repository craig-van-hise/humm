import React, { useState } from 'react';
import { BreathModeId, BreathMode, SequencePool } from '../types';
import { Activity, Plus, Trash2, Music } from 'lucide-react';
import { degreeToSemitones } from '../utils/pitchMath';

export const DEFAULT_BREATH_MODES: BreathMode[] = [
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
    restSec: 180,
  },
];

export const DEFAULT_SEQUENCE_POOLS: SequencePool[] = [
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

interface SequenceSelectorProps {
  selectedBreathMode: BreathModeId;
  onSelectBreathMode: (mode: BreathMode) => void;
  presets: SequencePool[];
  selectedPoolId: string;
  onSelectSequencePool: (pool: SequencePool) => void;
  onAddPreset: (newPreset: SequencePool) => void;
  onDeletePreset: (id: string) => void;
}

export const SequenceSelector: React.FC<SequenceSelectorProps> = ({
  selectedBreathMode,
  onSelectBreathMode,
  presets,
  selectedPoolId,
  onSelectSequencePool,
  onAddPreset,
  onDeletePreset,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newDegreesInput, setNewDegreesInput] = useState<string>('1, b2, 1, b3, 1');

  const handleCreate = () => {
    if (!newPresetName.trim()) return;
    const rawDegrees = newDegreesInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (rawDegrees.length === 0) return;

    const intervalOffsets = rawDegrees.map(degreeToSemitones);

    onAddPreset({
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      intervalDegrees: rawDegrees,
      intervalOffsets,
      isCustom: true,
    });

    setNewPresetName('');
    setIsAdding(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto my-3 space-y-4">
      {/* Breath Pacing Presets */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          Breath Pacing Protocol
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {DEFAULT_BREATH_MODES.map((mode) => {
            const isSelected = selectedBreathMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => onSelectBreathMode(mode)}
                className={`p-2.5 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
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

      {/* Melodic Sequence Horizontal Carousel */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Music className="w-4 h-4 text-emerald-400" />
            Melodic Sequence Presets
          </h3>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Preset
          </button>
        </div>

        {/* Add Custom Preset Form Drawer */}
        {isAdding && (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2.5 my-2">
            <input
              type="text"
              placeholder="Preset Name (e.g., Minor Pentatonic)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <input
              type="text"
              placeholder="Degrees separated by comma (e.g., 1, b3, 4, 5, b7)"
              value={newDegreesInput}
              onChange={(e) => setNewDegreesInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Save Preset
              </button>
            </div>
          </div>
        )}

        {/* Horizontal Scroll Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-700">
          {presets.map((preset) => {
            const isSelected = preset.id === selectedPoolId;

            return (
              <div
                key={preset.id}
                onClick={() => onSelectSequencePool(preset)}
                className={`snap-start shrink-0 min-w-[170px] max-w-[210px] p-3 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header & Delete Option */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-white truncate pr-2">
                    {preset.name}
                  </span>
                  {preset.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePreset(preset.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-0.5"
                      aria-label="Delete preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Degrees Pills */}
                <div className="flex flex-wrap gap-1">
                  {preset.intervalDegrees.map((deg, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-950 text-cyan-400 border border-slate-800 rounded px-1.5 py-0.5 font-mono"
                    >
                      {deg}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
