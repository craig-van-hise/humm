import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PianoKeyboard, generateKeysForOctave, getOctave } from '../PianoKeyboard';

afterEach(() => {
  cleanup();
});

describe('PianoKeyboard PRP #9 Phase 1 - Decoupled Static Piano Keyboard', () => {
  it('increments visual keyboardOctave when user clicks Octave Up while leaving rootNote unchanged', () => {
    const onSelectRootMock = vi.fn();
    render(<PianoKeyboard activeNote={null} rootNote="C3" onSelectRoot={onSelectRootMock} />);

    // Initially keyboardOctave is 2 (C2 to B3)
    expect(screen.getByTestId('keyboard-octave-display').textContent).toContain('Octave 2');
    expect(screen.getByTestId('key-C2')).toBeDefined();
    expect(screen.getByTestId('key-B3')).toBeDefined();

    // Click Octave Up button
    const octaveUpBtn = screen.getByTestId('octave-up');
    fireEvent.click(octaveUpBtn);

    // rootNote onSelectRoot MUST NOT be called!
    expect(onSelectRootMock).not.toHaveBeenCalled();

    // Visual keyboardOctave MUST increment to 3 (C3 to B4)
    expect(screen.getByTestId('keyboard-octave-display').textContent).toContain('Octave 3');
    expect(screen.getByTestId('key-C3')).toBeDefined();
    expect(screen.getByTestId('key-B4')).toBeDefined();
  });

  it('updates rootNote when user clicks "D3" key without auto-shifting visual keyboardOctave', () => {
    const TestComponent = () => {
      const [root, setRoot] = useState('C2');
      return <PianoKeyboard activeNote={null} rootNote={root} onSelectRoot={setRoot} />;
    };

    render(<TestComponent />);

    // Initially keyboardOctave is 2
    expect(screen.getByTestId('keyboard-octave-display').textContent).toContain('Octave 2');
    expect(screen.getByTestId('key-C2')).toBeDefined();

    // Click D3 key (which exists in the 2nd octave of the 2-octave C2-B3 view)
    const d3Key = screen.getByTestId('key-D3');
    fireEvent.click(d3Key);

    // Root note updates to D3 in header
    expect(screen.getByTestId('root-note-display').textContent).toBe('D3');

    // Visual keyboardOctave MUST remain 2 (no auto-shifting to octave 3!)
    expect(screen.getByTestId('keyboard-octave-display').textContent).toContain('Octave 2');
    expect(screen.getByTestId('key-C2')).toBeDefined();
    expect(screen.getByTestId('key-B3')).toBeDefined();
  });
});

describe('PianoKeyboard PRP #14 Phase 1 - Acoustic Black Key Geometry', () => {
  it('calculates acoustic leftPercent for Octave 0 and Octave 1 black keys', () => {
    render(<PianoKeyboard activeNote={null} rootNote="C2" onSelectRoot={() => {}} />);

    const cs2Key = screen.getByTestId('key-C#2');
    const ds2Key = screen.getByTestId('key-D#2');
    const cs3Key = screen.getByTestId('key-C#3');

    expect(cs2Key.style.left).toBe('6.75%');
    expect(ds2Key.style.left).toBe('14.65%');
    expect(cs3Key.style.left).toBe('56.75%');
  });
});

describe('PianoKeyboard PRP #15 Phase 1 - White Key Visual Outline & Seam Separation', () => {
  it('ensures unselected white key contains border, border-slate-300, and shadow-sm', () => {
    render(<PianoKeyboard activeNote={null} rootNote="C3" onSelectRoot={() => {}} />);

    const d3Key = screen.getByTestId('key-D3');
    expect(d3Key.className).toContain('border');
    expect(d3Key.className).toContain('border-slate-300');
    expect(d3Key.className).toContain('shadow-sm');
  });
});

describe('PianoKeyboard PRP #14 Phase 3 - Octave 2 Default Calibration', () => {
  it('returns 2 as fallback for getOctave with invalid note string', () => {
    expect(getOctave("InvalidNote")).toBe(2);
  });

  it('defaults keyboardOctave state to Octave 2 on initial mount displaying C2 through B3', () => {
    render(<PianoKeyboard activeNote={null} rootNote="C3" onSelectRoot={() => {}} />);

    expect(screen.getByTestId('keyboard-octave-display').textContent).toContain('Octave 2');
    expect(screen.getByTestId('key-C2')).toBeDefined();
    expect(screen.getByTestId('key-B3')).toBeDefined();
  });
});

describe('PianoKeyboard PRP #15 Phase 2 - Relocation of Peak Sinus NO Zone Banner', () => {
  it('renders peak sinus banner below the keyboard container in DOM order when rootNote is C3', () => {
    render(<PianoKeyboard activeNote={null} rootNote="C3" onSelectRoot={() => {}} />);

    const rootWrapper = screen.getByTestId('piano-keyboard');
    const container = screen.getByTestId('keyboard-container');
    const banner = screen.getByTestId('peak-sinus-banner');

    const containerIndex = Array.from(rootWrapper.children).indexOf(container);
    const bannerIndex = Array.from(rootWrapper.children).indexOf(banner);

    expect(containerIndex).toBeGreaterThan(-1);
    expect(bannerIndex).toBeGreaterThan(-1);
    expect(bannerIndex).toBeGreaterThan(containerIndex);
  });
});
