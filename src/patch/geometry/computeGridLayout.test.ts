import { describe, expect, it } from 'vitest';

import { computeGridLayout } from './computeGridLayout';
import type { QubitData } from '../types';

describe('patch/geometry/computeGridLayout', () => {
  it('uses the data-qubit pitch and passes through a data qubit', () => {
    const qubits: QubitData[] = [
      { id: 'a', type: 'ancilla', coordinates: [1, 1] },
      { id: 'q0', type: 'data', coordinates: [0.5, 0.5] },
      { id: 'q1', type: 'data', coordinates: [1.5, 0.5] },
      { id: 'q2', type: 'data', coordinates: [0.5, 1.5] },
    ];
    expect(computeGridLayout(qubits)).toEqual({ spacing: 1, origin: [0.5, 0.5] });
  });

  it('follows a wider pitch', () => {
    const qubits: QubitData[] = [
      { id: 'd0', type: 'data', coordinates: [0, 0] },
      { id: 'd1', type: 'data', coordinates: [2, 0] },
      { id: 'd2', type: 'data', coordinates: [4, 0] },
      { id: 'a0', type: 'ancilla', coordinates: [1, 1] },
    ];
    expect(computeGridLayout(qubits)).toEqual({ spacing: 2, origin: [0, 0] });
  });

  it('falls back to a unit grid at the origin without data qubits', () => {
    expect(computeGridLayout([])).toEqual({ spacing: 1, origin: [0, 0] });
    expect(computeGridLayout([{ id: 'a', type: 'ancilla', coordinates: [1, 1] }])).toEqual({ spacing: 1, origin: [0, 0] });
  });

  it('falls back to a unit spacing for a single data qubit', () => {
    expect(computeGridLayout([{ id: 'd', type: 'data', coordinates: [2.5, 3.5] }])).toEqual({ spacing: 1, origin: [2.5, 3.5] });
  });
});
