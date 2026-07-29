import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAudioEngine } from '../useAudioEngine';
import * as Tone from 'tone';

const filterRampMock = vi.fn();

vi.mock('tone', () => {
  function MockSynth(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.oscillator = { type: 'triangle' };
    this.triggerAttackRelease = vi.fn();
    this.triggerRelease = vi.fn();
    this.dispose = vi.fn();
  }

  function MockGain(this: any) {
    this.toDestination = vi.fn().mockReturnThis();
    this.connect = vi.fn().mockReturnThis();
    this.gain = { rampTo: vi.fn(), setValueAtTime: vi.fn() };
    this.dispose = vi.fn();
  }

  function MockFilter(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.frequency = { rampTo: filterRampMock };
    this.dispose = vi.fn();
  }

  function MockOmniOscillator(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.start = vi.fn();
    this.stop = vi.fn();
    this.type = 'sawtooth';
    this.dispose = vi.fn();
    this.frequency = { setValueAtTime: vi.fn(), rampTo: vi.fn() };
  }

  function MockPlayer(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.start = vi.fn();
    this.stop = vi.fn();
    this.dispose = vi.fn();
    this.loaded = true;
    this.playbackRate = 1;
  }

  function MockFrequency() {
    return {
      toMidi: () => 60,
      toFrequency: () => 261.63,
    };
  }

  return {
    now: () => 0,
    Synth: vi.fn().mockImplementation(function(this: any) { MockSynth.call(this); }),
    Gain: vi.fn().mockImplementation(function(this: any) { MockGain.call(this); }),
    Filter: vi.fn().mockImplementation(function(this: any) { MockFilter.call(this); }),
    OmniOscillator: vi.fn().mockImplementation(function(this: any) { MockOmniOscillator.call(this); }),
    Player: vi.fn().mockImplementation(function(this: any) { MockPlayer.call(this); }),
    Frequency: MockFrequency,
    start: vi.fn().mockResolvedValue(undefined),
    loaded: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('../../utils/audioContext', () => ({
  unlockAudioContext: vi.fn().mockResolvedValue(true),
}));

describe('useAudioEngine PRP #11 - Seamless Tone & Guide Filter Mutations', () => {
  it('directly mutates waveform properties and sweeps filter frequencies without resetting nodes', async () => {
    const { result, rerender } = renderHook(
      (props) => useAudioEngine(props),
      {
        initialProps: {
          rootNote: 'C3',
          droneRootVol: 0.6,
          droneFifthVol: 0.35,
          guideVol: 0.9,
          droneRootWaveform: 'sawtooth' as Tone.ToneOscillatorType,
          droneRootFilterFreq: 500,
          droneFifthWaveform: 'triangle' as Tone.ToneOscillatorType,
          droneFifthFilterFreq: 600,
          guideWaveform: 'triangle' as Tone.ToneOscillatorType,
          guideFilterFreq: 1000,
        },
      }
    );

    // Initialize audio engine
    await result.current.initEngine();

    // Trigger props update (dynamic waveform and filter frequency changes)
    rerender({
      rootNote: 'C3',
      droneRootVol: 0.6,
      droneFifthVol: 0.35,
      guideVol: 0.9,
      droneRootWaveform: 'square' as Tone.ToneOscillatorType,
      droneRootFilterFreq: 800,
      droneFifthWaveform: 'sine' as Tone.ToneOscillatorType,
      droneFifthFilterFreq: 1200,
      guideWaveform: 'sawtooth' as Tone.ToneOscillatorType,
      guideFilterFreq: 1500,
    });

    // Check filter ramps called for root filter, fifth filter, and guide filter
    expect(filterRampMock).toHaveBeenCalledWith(800, 0.1);
    expect(filterRampMock).toHaveBeenCalledWith(1200, 0.1);
    expect(filterRampMock).toHaveBeenCalledWith(1500, 0.1);
  });
});
