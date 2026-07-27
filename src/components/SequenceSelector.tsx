import React, { useState } from 'react';
import { Plus, Edit3, Trash2, RotateCcw, Activity, Music } from 'lucide-react';
import { BreathModeId, BreathMode } from '../types';

export interface SequencePreset {
  id: string;
  name: string;
  degrees: string[];
}

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

export const DEFAULT_SEQUENCE_PRESETS: SequencePreset[] = [
  {
    id: 'micro_tuning',
    name: 'Gentle Micro-Tuning',
    degrees: ['1', 'b2', '1', 'b3', '1'],
  },
  {
    id: 'sub_tonic_dip',
    name: 'Sub-Tonic Dip',
    degrees: ['1', '7v', '1'],
  },
  {
    id: 'resonance_anchor',
    name: 'Resonance Anchor',
    degrees: ['1', '5', '1'],
  },
  {
    id: 'triadic',
    name: 'Triadic Foundation',
    degrees: ['1', '3', '5', '3', '1'],
  },
  {
    id: 'five_note',
    name: 'Five-Note Slide',
    degrees: ['1', '2', '3', '4', '5', '4', '3', '2', '1'],
  },
];

export interface SequenceSelectorProps {
  selectedBreathMode: BreathModeId;
  onSelectBreathMode: (mode: BreathMode) => void;
  presets: SequencePreset[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddPreset: (newPreset: SequencePreset) => void;
  onEditPreset: (updatedPreset: SequencePreset) => void;
  onDeletePreset: (id: string) => void;
  onResetDefaults: () => void;
}

export const SequenceSelector: React.FC<SequenceSelectorProps> = ({
  selectedBreathMode,
  onSelectBreathMode,
  presets,
  selectedId,
  onSelect,
  onAddPreset,
  onEditPreset,
  onDeletePreset,
  onResetDefaults,
}) => {
  const [mode, setMode] = useState<'idle' | 'add' | 'edit'>('idle');
  const [formName, setFormName] = useState('');
  const [formDegrees, setFormDegrees] = useState('');

  const activePreset = presets.find((p) => p.id === selectedId);

  const handleOpenAdd = () => {
    setFormName('');
    setFormDegrees('1, 7v, 1');
    setMode('add');
  };

  const handleOpenEdit = () => {
    if (!activePreset) return;
    setFormName(activePreset.name);
    setFormDegrees(activePreset.degrees.join(', '));
    setMode('edit');
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    const degrees = formDegrees.split(',').map((s) => s.trim()).filter(Boolean);

    if (mode === 'add') {
      onAddPreset({
        id: `preset-${Date.now()}`,
        name: formName,
        degrees,
      });
    } else if (mode === 'edit' && activePreset) {
      onEditPreset({
        ...activePreset,
        name: formName,
        degrees,
      });
    }

    setMode('idle');
  };

  return (
    <div className="w-full max-w-lg mx-auto my-3 space-y-4">
      {/* Breath Pacing Protocols */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          Breath Pacing Protocol
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {DEFAULT_BREATH_MODES.map((bMode) => {
            const isSelected = selectedBreathMode === bMode.id;

            return (
              <button
                key={bMode.id}
                onClick={() => onSelectBreathMode(bMode)}
                className={`p-2.5 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{bMode.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {bMode.inhaleSec}s / {bMode.humSec}s / {bMode.restSec}s
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Melodic Sequence Carousel */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Music className="w-4 h-4 text-emerald-400" />
            Melodic Sequence Presets
          </h3>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onResetDefaults}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              title="Reset default presets"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>

            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Inline Form Drawer for Add & Edit */}
        {mode !== 'idle' && (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2 my-2">
            <div className="text-xs font-semibold text-slate-300">
              {mode === 'add' ? 'Create New Preset' : `Editing: ${activePreset?.name}`}
            </div>

            <input
              type="text"
              placeholder="Preset Name (e.g. Sub-Tonic Dip)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <input
              type="text"
              placeholder="Comma-separated degrees (e.g. 1, 7v, 1, 3, 5)"
              value={formDegrees}
              onChange={(e) => setFormDegrees(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <span className="text-[10px] text-slate-500 block">
              Tip: Use <code className="text-cyan-400">7v</code> or <code className="text-cyan-400">b7v</code> for pitches below the tonic.
            </span>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setMode('idle')}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Horizontal Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-700">
          {presets.map((preset) => {
            const isSelected = preset.id === selectedId;

            return (
              <div
                key={preset.id}
                onClick={() => onSelect(preset.id)}
                className={`snap-start shrink-0 min-w-[160px] max-w-[200px] p-3 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-800 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-white truncate pr-2">
                    {preset.name}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePreset(preset.id);
                    }}
                    className="text-slate-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer"
                    aria-label="Delete preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {preset.degrees.map((deg, idx) => (
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
