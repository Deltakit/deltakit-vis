import type { QubitData } from '../types';

export interface GridLayout {
  /** Distance between adjacent grid lines (the data-qubit pitch). */
  spacing: number;
  /** A point the grid lines pass through (a data qubit), so lines sit on the data qubits. */
  origin: [number, number];
}

const DEFAULT_LAYOUT: GridLayout = { spacing: 1, origin: [0, 0] };
const EPS = 1e-6;

/**
 * Grid layout for the 2D patch: one cell per square plaquette.
 *
 * Square plaquettes have data qubits at their corners, so the grid uses the
 * data-qubit pitch as its spacing and passes through a data qubit.
 */
export function computeGridLayout(qubits: QubitData[]): GridLayout {
  const data = qubits.filter(q => q.type === 'data');
  if (data.length === 0) return DEFAULT_LAYOUT;

  // Smallest non-zero gap between data qubits along either axis.
  let spacing = Infinity;
  for (const axis of [0, 1] as const) {
    const values = [...new Set(data.map(q => q.coordinates[axis]))].sort((a, b) => a - b);
    for (let i = 1; i < values.length; i++) {
      const gap = values[i] - values[i - 1];
      if (gap > EPS) spacing = Math.min(spacing, gap);
    }
  }

  return {
    spacing: Number.isFinite(spacing) ? spacing : DEFAULT_LAYOUT.spacing,
    origin: data[0].coordinates,
  };
}
