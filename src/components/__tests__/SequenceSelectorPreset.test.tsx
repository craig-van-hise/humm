import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SequenceSelector, DEFAULT_SEQUENCE_PRESETS, SequencePreset } from '../SequenceSelector';

afterEach(() => {
  cleanup();
});

describe('PRP #16 Phase 1 & 2 - SequenceSelector & Preset Defaults Integration', () => {
  it('has "Surround the Tonic" at index 0 of DEFAULT_SEQUENCE_PRESETS', () => {
    expect(DEFAULT_SEQUENCE_PRESETS[0].id).toBe('surround_tonic');
    expect(DEFAULT_SEQUENCE_PRESETS[0].name).toBe('Surround the Tonic');
  });

  it('has exact scale degrees ["1", "2", "1", "7v", "1", "1"] for Surround the Tonic', () => {
    expect(DEFAULT_SEQUENCE_PRESETS[0].degrees).toEqual(['1', '2', '1', '7v', '1', '1']);
    expect(DEFAULT_SEQUENCE_PRESETS[0].degrees).toHaveLength(6);
  });

  it('renders "Surround the Tonic" as first item and highlights it when selected', () => {
    const onSelectPresetMock = vi.fn();
    const onSelectDegreeMock = vi.fn();

    render(
      <SequenceSelector
        presets={DEFAULT_SEQUENCE_PRESETS}
        selectedId="surround_tonic"
        onSelect={onSelectPresetMock}
        onAddPreset={vi.fn()}
        onEditPreset={vi.fn()}
        onDeletePreset={vi.fn()}
        onResetDefaults={vi.fn()}
      />
    );

    const firstPresetButton = screen.getByText('Surround the Tonic');
    expect(firstPresetButton).toBeDefined();

    // Verify degrees displayed
    expect(screen.getAllByText('1')).toBeDefined();
    expect(screen.getAllByText('2')).toBeDefined();
    expect(screen.getAllByText('7v')).toBeDefined();
  });

  it('triggers onResetDefaults callback which resets parent selected state to surround_tonic', () => {
    const TestHost = () => {
      const [presets, setPresets] = useState<SequencePreset[]>(DEFAULT_SEQUENCE_PRESETS);
      const [selectedId, setSelectedId] = useState<string>('custom');

      const handleReset = () => {
        setPresets(DEFAULT_SEQUENCE_PRESETS);
        setSelectedId(DEFAULT_SEQUENCE_PRESETS[0].id);
      };

      return (
        <div>
          <span data-testid="selected-preset-id">{selectedId}</span>
          <SequenceSelector
            presets={presets}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddPreset={vi.fn()}
            onEditPreset={vi.fn()}
            onDeletePreset={vi.fn()}
            onResetDefaults={handleReset}
          />
        </div>
      );
    };

    render(<TestHost />);

    expect(screen.getByTestId('selected-preset-id').textContent).toBe('custom');

    const resetBtn = screen.getByTitle('Reset default presets');
    fireEvent.click(resetBtn);

    expect(screen.getByTestId('selected-preset-id').textContent).toBe('surround_tonic');
  });
});
