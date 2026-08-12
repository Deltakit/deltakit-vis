import { describe, it, expect } from 'vitest';
import type { RenderData } from '@/types/renderData';
import { deriveSlices } from '@/react/slices';

function surface(id: string, startHeight: number, opName = 'log_asm.meas_stab') {
  return {
    type: 'surface' as const,
    id,
    op_name: opName,
    size: [3, 3] as [number, number],
    location: [1, 1] as [number, number],
    startHeight,
    colour: 'BLUE' as const,
  };
}

function side(fromSurfaceId: string, toSurfaceId: string, opName = 'log_asm.meas_stab') {
  return {
    type: 'side' as const,
    op_name: opName,
    fromSurfaceId,
    toSurfaceId,
    colourScheme: ['BLUE' as const, 'RED' as const],
  };
}

describe('deriveSlices', () => {
  it('returns nothing for missing data', () => {
    expect(deriveSlices(undefined)).toEqual([]);
    expect(deriveSlices({ ops: [] })).toEqual([]);
  });

  it('emits one slice per round spanned by a meas_stab', () => {
    const data: RenderData = {
      ops: [surface('a', 0, 'log_asm.prepare'), side('a', 'b'), surface('b', 20)],
    };

    const slices = deriveSlices(data);

    expect(slices).toHaveLength(20);
    expect(slices.map((s) => s.round)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('places each plane inside its round, between the boundaries', () => {
    const data: RenderData = {
      ops: [surface('a', 0, 'log_asm.prepare'), side('a', 'b'), surface('b', 3)],
    };

    expect(deriveSlices(data)).toEqual([
      { id: 'round-1', round: 1, z: 0.5, label: 'Round 1' },
      { id: 'round-2', round: 2, z: 1.5, label: 'Round 2' },
      { id: 'round-3', round: 3, z: 2.5, label: 'Round 3' },
    ]);
  });

  it('numbers a later span as startHeight + its own round index', () => {
    // Mirrors src/main.ts: prepare at 0, then two meas_stab spans of 3.
    const data: RenderData = {
      ops: [
        surface('lq_p', 0, 'log_asm.prepare'),
        side('lq_p', 'none_1'),
        surface('none_1', 3),
        side('none_1', 'none_2'),
        surface('none_2', 6),
      ],
    };

    expect(deriveSlices(data).map((s) => [s.round, s.z])).toEqual([
      [1, 0.5],
      [2, 1.5],
      [3, 2.5],
      [4, 3.5],
      [5, 4.5],
      [6, 5.5],
    ]);
  });

  it('ignores ops that span height without holding rounds', () => {
    const data: RenderData = {
      ops: [
        surface('a', 0, 'log_asm.prepare'),
        side('a', 'b', 'log_asm.multi_pauli_meas'),
        surface('b', 4, 'log_asm.multi_pauli_meas'),
      ],
    };

    expect(deriveSlices(data)).toEqual([]);
  });

  it('ignores a meas_stab whose surfaces are missing', () => {
    expect(deriveSlices({ ops: [side('missing-from', 'missing-to')] })).toEqual([]);
  });

  it('counts a round once when parallel branches share it', () => {
    // Two meas_stab ops running in parallel over the same heights.
    const data: RenderData = {
      ops: [
        surface('a1', 0, 'log_asm.prepare'),
        surface('a2', 0, 'log_asm.prepare'),
        side('a1', 'b1'),
        side('a2', 'b2'),
        surface('b1', 2),
        surface('b2', 2),
      ],
    };

    expect(deriveSlices(data).map((s) => s.round)).toEqual([1, 2]);
  });
});
