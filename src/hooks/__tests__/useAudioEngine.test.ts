import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAudioEngine } from '../useAudioEngine';
import * as Tone from 'tone';

vi.mock('tone', () => {
  const triggerAttackReleaseMock = vi.fn();
  const nowMock = vi.fn(() => 123.456);

  function MockSynth(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.triggerAttackRelease = triggerAttackReleaseMock;
    this.triggerRelease = vi.fn();
    this.dispose = vi.fn();
  }

  function MockGain(this: any) {
    this.toDestination = vi.fn().mockReturnThis();
    this.gain = { rampTo: vi.fn() };
    this.dispose = vi.fn();
  }

  function MockFilter(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.dispose = vi.fn();
  }

  function MockOmniOscillator(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.start = vi.fn();
    this.stop = vi.fn();
    this.dispose = vi.fn();
    this.frequency = { setValueAtTime: vi.fn(), rampTo: vi.fn() };
  }

  function MockFrequency() {
    return {
      toMidi: () => 60,
      toFrequency: () => 261.63,
    };
  }

  return {
    now: nowMock,
    Synth: vi.fn().mockImplementation(function(this: any) { MockSynth.call(this); }),
    Gain: vi.fn().mockImplementation(function(this: any) { MockGain.call(this); }),
    Filter: vi.fn().mockImplementation(function(this: any) { MockFilter.call(this); }),
    OmniOscillator: vi.fn().mockImplementation(function(this: any) { MockOmniOscillator.call(this); }),
    Frequency: MockFrequency,
    start: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('../../utils/audioContext', () => ({
  unlockAudioContext: vi.fn().mockResolvedValue(true),
}));

describe('useAudioEngine Phase 1 - Audio Synchronization', () => {
  it('executes playGuidePitch synchronously passing Tone.now() without awaiting promises', async () => {
    const { result } = renderHook(() =>
      useAudioEngine({
        rootNote: 'C3',
        droneRootVol: 0.5,
        droneFifthVol: 0.5,
        guideVol: 0.8,
        isSessionActive: false,
      })
    );

    // Initialize engine
    await result.current.initEngine();

    const start = performance.now();
    // Execute playGuidePitch - must be non-async / synchronous
    const ret = result.current.playGuidePitch('C3', 1);
    const elapsed = performance.now() - start;

    expect(ret).toBeUndefined(); // Sync function returns undefined, not a Promise
    expect(elapsed).toBeLessThan(10); // Synchronous execution < 10ms

    const synthInstance = (Tone.Synth as any).mock.results[0].value;
    expect(synthInstance.triggerAttackRelease).toHaveBeenCalledWith('C3', 1, 123.456);
  });
});
