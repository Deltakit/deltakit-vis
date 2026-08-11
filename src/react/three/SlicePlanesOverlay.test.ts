import { describe, it, expect } from 'vitest';
import type { RenderData } from '@/types/renderData';
import { computeSceneBounds } from '@/react/three/SlicePlanesOverlay';

function surface(location: [number, number], size: [number, number], startHeight = 0) {
  return {
    type: 'surface' as const,
    id: `${location[0]}-${location[1]}-${startHeight}`,
    size,
    location,
    startHeight,
    colour: 'BLUE' as const,
  };
}

describe('computeSceneBounds', () => {
  it('spans the union of every surface footprint', () => {
    const data: RenderData = {
      ops: [surface([1, 1], [3, 3]), surface([6, 2], [3, 5], 4)],
    };

    // x: 1..9, y: 1..7
    expect(computeSceneBounds(data)).toEqual({ centerX: 5, centerY: 4, width: 8, depth: 6 });
  });

  it('treats location as the minimum corner, not the centre', () => {
    const data: RenderData = { ops: [surface([1, 1], [3, 3])] };

    expect(computeSceneBounds(data)).toEqual({ centerX: 2.5, centerY: 2.5, width: 3, depth: 3 });
  });

  it('falls back to a unit footprint when there are no surfaces', () => {
    expect(computeSceneBounds({ ops: [] })).toEqual({
      centerX: 0.5,
      centerY: 0.5,
      width: 1,
      depth: 1,
    });
  });
});
