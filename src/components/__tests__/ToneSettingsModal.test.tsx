import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToneSettingsModal } from '../ToneSettingsModal';

describe('ToneSettingsModal (PRP #10 & #11)', () => {
  it('renders correctly when open and triggers waveform & filter update callbacks', () => {
    const setDroneRootWaveformMock = vi.fn();
    const setDroneRootFilterFreqMock = vi.fn();
    const setDroneFifthWaveformMock = vi.fn();
    const setDroneFifthFilterFreqMock = vi.fn();
    const setGuideWaveformMock = vi.fn();
    const setGuideFilterFreqMock = vi.fn();
    const onCloseMock = vi.fn();
    const onResetDefaultsMock = vi.fn();

    render(
      <ToneSettingsModal
        isOpen={true}
        onClose={onCloseMock}
        droneRootWaveform="sawtooth"
        setDroneRootWaveform={setDroneRootWaveformMock}
        droneRootFilterFreq={500}
        setDroneRootFilterFreq={setDroneRootFilterFreqMock}
        droneFifthWaveform="triangle"
        setDroneFifthWaveform={setDroneFifthWaveformMock}
        droneFifthFilterFreq={600}
        setDroneFifthFilterFreq={setDroneFifthFilterFreqMock}
        guideWaveform="triangle"
        setGuideWaveform={setGuideWaveformMock}
        guideFilterFreq={1000}
        setGuideFilterFreq={setGuideFilterFreqMock}
        onResetDefaults={onResetDefaultsMock}
      />
    );

    // Modal Header Title
    expect(screen.getByText(/Acoustic Tone & Filter Settings/i)).toBeTruthy();

    // Select Sine for Drone Root
    const sineButtons = screen.getAllByRole('button', { name: /Sine/i });
    fireEvent.click(sineButtons[0]);
    expect(setDroneRootWaveformMock).toHaveBeenCalledWith('sine');

    // Change Root Filter Cutoff Slider
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '800' } });
    expect(setDroneRootFilterFreqMock).toHaveBeenCalledWith(800);

    // Change Guide Filter Cutoff Slider (3rd slider)
    fireEvent.change(sliders[2], { target: { value: '1500' } });
    expect(setGuideFilterFreqMock).toHaveBeenCalledWith(1500);

    // Click Reset Defaults
    const resetButton = screen.getByRole('button', { name: /Reset Defaults/i });
    fireEvent.click(resetButton);
    expect(onResetDefaultsMock).toHaveBeenCalled();

    // Click Done
    const doneButton = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <ToneSettingsModal
        isOpen={false}
        onClose={vi.fn()}
        droneRootWaveform="sawtooth"
        setDroneRootWaveform={vi.fn()}
        droneRootFilterFreq={500}
        setDroneRootFilterFreq={vi.fn()}
        droneFifthWaveform="triangle"
        setDroneFifthWaveform={vi.fn()}
        droneFifthFilterFreq={600}
        setDroneFifthFilterFreq={vi.fn()}
        guideWaveform="triangle"
        setGuideWaveform={vi.fn()}
        guideFilterFreq={1000}
        setGuideFilterFreq={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
