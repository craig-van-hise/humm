import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioEngine } from '../useAudioEngine';
import { DroneSource } from '../../types';

let playerInstances: any[] = [];

vi.mock('tone', () => {
  function MockSynth(this: any) {
    this.connect = vi.fn().mockReturnThis();
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

  function MockPlayer(this: any, opts: any) {
    this.url = opts?.url;
    this.loop = opts?.loop;
    this.connect = vi.fn().mockReturnThis();
    this.start = vi.fn();
    this.stop = vi.fn();
    this.dispose = vi.fn();
    this.loaded = true;
    this.playbackRate = 1;
    this.buffer = { duration: 18 };
    playerInstances.push(this);
  }

  function MockFrequency(val?: any) {
    return {
      toMidi: () => (val === 'C4' ? 72 : 60),
      toFrequency: () => (val === 'C4' ? 261.62 : 130.81),
    };
  }

  return {
    now: () => 0,
    Synth: vi.fn().mockImplementation(function(this: any) { MockSynth.call(this); }),
    Gain: vi.fn().mockImplementation(function(this: any) { MockGain.call(this); }),
    Filter: vi.fn().mockImplementation(function(this: any) { MockFilter.call(this); }),
    OmniOscillator: vi.fn().mockImplementation(function(this: any) { MockOmniOscillator.call(this); }),
    Player: vi.fn().mockImplementation(function(this: any, opts: any) { MockPlayer.call(this, opts); }),
    Frequency: MockFrequency,
    start: vi.fn().mockResolvedValue(undefined),
    loaded: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('../../utils/audioContext', () => ({
  unlockAudioContext: vi.fn().mockResolvedValue(true),
}));

describe('useAudioEngine - Sample Loop Repitching & Live Switching', () => {
  it('calculates correct playbackRate based on target pitch and sample native frequency', async () => {
    playerInstances = [];

    const { result, rerender } = renderHook(
      (props) => useAudioEngine(props),
      {
        initialProps: {
          rootNote: 'C3',
          droneSource: 'tampura-1' as DroneSource,
          droneSampleVol: 0.7,
          droneRootVol: 0.6,
          droneFifthVol: 0.35,
          guideVol: 0.9,
          isSessionActive: true,
        },
      }
    );

    await act(async () => {
      await result.current.initEngine();
      await result.current.startDrone();
    });

    const activePlayers = playerInstances.slice(-4);
    const player1A = activePlayers.find((p) => p.url.includes('tanpura-c.wav'));
    expect(player1A).toBeDefined();

    // Rerender with pitch set to C4 (261.62 Hz) inside act
    await act(async () => {
      rerender({
        rootNote: 'C4',
        droneSource: 'tampura-1' as DroneSource,
        droneSampleVol: 0.7,
        droneRootVol: 0.6,
        droneFifthVol: 0.35,
        guideVol: 0.9,
        isSessionActive: true,
      });
    });

    // Tampura 1 native HZ = 138.59 (C#3). Target C4 = 261.62. Rate = 261.62 / 138.59 ≈ 1.888
    expect(player1A?.playbackRate).toBeCloseTo(1.888, 2);
  });

  it('switches drone sound sources mid-session and starts new player from start offset', async () => {
    playerInstances = [];

    const { result, rerender } = renderHook(
      (props) => useAudioEngine(props),
      {
        initialProps: {
          rootNote: 'C3',
          droneSource: 'tampura-1' as DroneSource,
          droneSampleVol: 0.7,
          droneRootVol: 0.6,
          droneFifthVol: 0.35,
          guideVol: 0.9,
          isSessionActive: true,
        },
      }
    );

    await act(async () => {
      await result.current.initEngine();
      await result.current.startDrone();
    });

    const activePlayers = playerInstances.slice(-4);
    const tampura1PlayerA = activePlayers.find((p) => p.url.includes('tanpura-c.wav'));
    const tampura2PlayerA = activePlayers.find((p) => p.url.includes('tampura-13610hz.mp3'));

    expect(tampura1PlayerA?.start).toHaveBeenCalledWith(0, 0);

    // Switch to Tampura 2 mid-session
    await act(async () => {
      rerender({
        rootNote: 'C3',
        droneSource: 'tampura-2' as DroneSource,
        droneSampleVol: 0.7,
        droneRootVol: 0.6,
        droneFifthVol: 0.35,
        guideVol: 0.9,
        isSessionActive: true,
      });
    });

    expect(tampura1PlayerA?.stop).toHaveBeenCalled();
    expect(tampura2PlayerA?.start).toHaveBeenCalledWith(0, 0);
  });
});
