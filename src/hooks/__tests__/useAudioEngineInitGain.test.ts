import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAudioEngine } from '../useAudioEngine';
import * as Tone from 'tone';

const gainConstructorSpy = vi.fn();

vi.mock('tone', () => {
  function MockSynth(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.oscillator = { type: 'triangle' };
    this.triggerAttackRelease = vi.fn();
    this.triggerRelease = vi.fn();
    this.dispose = vi.fn();
  }

  function MockGain(this: any, initialVol: number) {
    gainConstructorSpy(initialVol);
    this.toDestination = vi.fn().mockReturnThis();
    this.connect = vi.fn().mockReturnThis();
    this.gain = { rampTo: vi.fn(), setValueAtTime: vi.fn() };
    this.dispose = vi.fn();
  }

  function MockFilter(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.frequency = { rampTo: vi.fn() };
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
    Gain: vi.fn().mockImplementation(function(this: any, vol: number) { MockGain.call(this, vol); }),
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

describe('useAudioEngine PRP #13 - Non-Silent Engine Initialization', () => {
  it('initializes Tone.Gain nodes with saved initial volume levels instead of 0', async () => {
    gainConstructorSpy.mockClear();

    const { result } = renderHook(() =>
      useAudioEngine({
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
      })
    );

    // Call initEngine (simulating session start after page reload)
    await result.current.initEngine();

    // Verify Gain constructors received initial state values (0.6, 0.35, 0.7 sample gain, 0.9)
    expect(gainConstructorSpy).toHaveBeenCalledWith(0.6);
    expect(gainConstructorSpy).toHaveBeenCalledWith(0.35);
    expect(gainConstructorSpy).toHaveBeenCalledWith(0.7);
    expect(gainConstructorSpy).toHaveBeenCalledWith(0.9);
  });
});
