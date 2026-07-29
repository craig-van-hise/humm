import React from 'react';
import { Sliders, Wind } from 'lucide-react';
import { TimingSettings } from './TimingSettingsModal';

export type PacingPresetId = 'vagal-calm' | 'focus-theta' | 'sinus-recharge' | 'free' | 'custom';

export interface PacingModeSelectorProps {
  selectedMode: PacingPresetId;
  onSelectMode: (mode: PacingPresetId) => void;
  customSettings: TimingSettings;
  onOpenCustomModal: () => void;
  sequenceNoteCount: number;
}

export const PacingModeSelector = ({
  selectedMode,
  onSelectMode,
  customSettings,
  onOpenCustomModal,
}: PacingModeSelectorProps) => {
  const PRESETS: { id: PacingPresetId; name: string; subtitle: string; desc: string }[] = [
    {
      id: 'vagal-calm',
      name: 'Vagal Calm',
      subtitle: 'Extended Exhalation',
      desc: '4s / 10s / 4s',
    },
    {
      id: 'focus-theta',
      name: 'Focus / Theta',
      subtitle: 'Shorter Bursts',
      desc: '3s / 6s / 2s',
    },
    {
      id: 'sinus-recharge',
      name: 'Sinus NO Recharge',
      subtitle: 'NO Regeneration',
      desc: '4s / 10s / 180s',
    },
    {
      id: 'free',
      name: 'Free Mode',
      subtitle: 'Open Improvisation',
      desc: 'Continuous Drone',
    },
  ];

  // Calculate display string for custom card
  const customHumDisplay =
    customSettings.mode === 'fixed-note'
      ? `${customSettings.noteSec}s/note`
      : `${customSettings.totalHumSec}s total`;

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
        <Wind className="w-3.5 h-3.5 text-cyan-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Breath Pacing Protocol
        </h3>
      </div>

      {/* Grid of Pacing Mode Cards */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Preset Cards */}
        {PRESETS.map((preset) => {
          const isSelected = selectedMode === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectMode(preset.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? preset.id === 'free'
                    ? 'bg-slate-800 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.2)] text-white'
                    : 'bg-slate-800 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)] text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-white block">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 block mb-2">
                  {preset.subtitle}
                </span>
              </div>

              <span className={`text-[11px] font-mono font-semibold ${preset.id === 'free' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {preset.desc}
              </span>
            </button>
          );
        })}

        {/* 5th Card: Dedicated "Custom Timing" Mode */}
        <div
          onClick={() => onSelectMode('custom')}
          className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
            selectedMode === 'custom'
              ? 'bg-slate-800 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.2)] text-white'
              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-white block">
                Custom Timing
              </span>
              <span className="text-[10px] text-amber-400 font-medium block">
                User Defined
              </span>
            </div>

            {/* Gear/Edit Icon to open timing modal */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevents double toggle
                onSelectMode('custom');
                onOpenCustomModal();
              }}
              className="p-1 rounded-md bg-slate-950/80 text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition-colors cursor-pointer"
              title="Configure custom timings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] font-mono font-semibold text-amber-300 mt-2">
            {customSettings.inhaleSec}s / {customHumDisplay} / {customSettings.restSec}s
          </div>
        </div>
      </div>
    </div>
  );
};
