import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionEngine } from '../useSessionEngine';

describe('useSessionEngine - Free Mode Protocol', () => {
  it('transitions directly to free phase without running guide pitch timers when isFreeMode is true', () => {
    const playPitchMock = vi.fn();
    const stopAudioMock = vi.fn();

    const { result } = renderHook(() =>
      useSessionEngine({
        rootNote: 'C3',
        degrees: ['1', '5', '1'],
        inhaleSec: 4,
        restSec: 4,
        noteDurationSec: 2,
        isFreeMode: true,
        onPlayPitch: playPitchMock,
        onStopAudio: stopAudioMock,
      })
    );

    expect(result.current.activePhase).toBe('ready');

    act(() => {
      result.current.startSession();
    });

    // In Free Mode, activePhase transitions immediately to 'free'
    expect(result.current.activePhase).toBe('free');

    // Guide tone sequence should NOT be triggered
    expect(playPitchMock).not.toHaveBeenCalled();

    // Stopping session returns to ready phase and triggers onStopAudio
    act(() => {
      result.current.stopSession();
    });

    expect(result.current.activePhase).toBe('ready');
    expect(stopAudioMock).toHaveBeenCalled();
  });
});
