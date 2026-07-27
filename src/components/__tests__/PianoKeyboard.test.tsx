import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PianoKeyboard, generateKeysForOctave } from '../PianoKeyboard';

afterEach(() => {
  cleanup();
});

describe('PianoKeyboard PRP #9 Phase 1 - Decoupled Static Piano Keyboard', () => {
  it('increments visual keyboardOctave when user clicks Octave Up while leaving rootNote unchanged', () => {
    const onSelectRootMock = vi.fn();
    render(<PianoKeyboard activeNote={null} rootNote="C3" onSelectRoot={onSelectRootMock} />);

    // Initially keyboardOctave is 3 (C3 to B4)
    expect(screen.getByTestId('keyboard-octave-display').textContent).toContain('Octave 3');
    expect(screen.getByTestId('key-C3')).toBeDefined();
    expect(screen.getByTestId('key-B4')).toBeDefined();

    // Click Octave Up button
    const octaveUpBtn = screen.getByTestId('octave-up');
    fireEvent.click(octaveUpBtn);

    // rootNote onSelectRoot MUST NOT be called!
    expect(onSelectRootMock).not.toHaveBeenCalled();

    // Visual keyboardOctave MUST increment to 4 (C4 to B5)
    expect(screen.getByTestId('keyboard-octave-display').textContent).toContain('Octave 4');
    expect(screen.getByTestId('key-C4')).toBeDefined();
    expect(screen.getByTestId('key-B5')).toBeDefined();
  });

  it('updates rootNote when user clicks "D4" key without auto-shifting visual keyboardOctave', () => {
    const TestComponent = () => {
      const [root, setRoot] = useState('C3');
      return <PianoKeyboard activeNote={null} rootNote={root} onSelectRoot={setRoot} />;
    };

    render(<TestComponent />);

    // Initially keyboardOctave is 3
    expect(screen.getByTestId('keyboard-octave-display').textContent).toContain('Octave 3');
    expect(screen.getByTestId('key-C3')).toBeDefined();

    // Click D4 key (which exists in the 2nd octave of the 2-octave C3-B4 view)
    const d4Key = screen.getByTestId('key-D4');
    fireEvent.click(d4Key);

    // Root note updates to D4 in header
    expect(screen.getByTestId('root-note-display').textContent).toBe('D4');

    // Visual keyboardOctave MUST remain 3 (no auto-shifting to octave 4!)
    expect(screen.getByTestId('keyboard-octave-display').textContent).toContain('Octave 3');
    expect(screen.getByTestId('key-C3')).toBeDefined();
    expect(screen.getByTestId('key-B4')).toBeDefined();
  });
});
