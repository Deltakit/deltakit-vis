import { describe, expect, it } from 'vitest';

import type { SurfaceOp } from '@/types/renderData';
import { createSurfaceLayerResolver, surfaceLayerSpacing } from '@/three/renderer/surfaceLayering';

function surface(overrides: Partial<SurfaceOp> = {}): SurfaceOp {
  return {
    type: 'surface',
    id: 'surface',
    size: [2, 2],
    location: [0, 0],
    startHeight: 0,
    colour: 'BLUE',
    ...overrides,
  };
}

describe('three/renderer/surfaceLayering', () => {
  it('separates overlapping surfaces by 0.01', () => {
    const resolveSurfaceLayerHeight = createSurfaceLayerResolver();

    expect(resolveSurfaceLayerHeight(surface({ id: 'first' }))).toBe(0);
    expect(resolveSurfaceLayerHeight(surface({ id: 'second' }))).toBe(surfaceLayerSpacing);
    expect(resolveSurfaceLayerHeight(surface({ id: 'third' }))).toBe(2 * surfaceLayerSpacing);
  });

  it('does not move surfaces when their footprints do not overlap', () => {
    const resolveSurfaceLayerHeight = createSurfaceLayerResolver();

    expect(resolveSurfaceLayerHeight(surface({ id: 'first' }))).toBe(0);
    expect(resolveSurfaceLayerHeight(surface({ id: 'second', location: [3, 0] }))).toBe(0);
  });

  it('moves invisible placeholder surfaces so generated geometry uses a free layer', () => {
    const resolveSurfaceLayerHeight = createSurfaceLayerResolver();

    expect(resolveSurfaceLayerHeight(surface({ id: 'visible' }))).toBe(0);
    expect(resolveSurfaceLayerHeight(surface({ id: 'placeholder', colour: 'NONE' }))).toBe(surfaceLayerSpacing);
  });

  it('separates the current visible and placeholder surface stack', () => {
    const resolveSurfaceLayerHeight = createSurfaceLayerResolver();

    expect(resolveSurfaceLayerHeight(surface({ id: 'qreg', colour: 'GREY', size: [12, 12] }))).toBe(0);
    expect(resolveSurfaceLayerHeight(surface({ id: 'qreg_1', size: [12, 12] }))).toBe(surfaceLayerSpacing);
    expect(resolveSurfaceLayerHeight(surface({ id: 'gen_id_0', colour: 'NONE', size: [12, 12] }))).toBe(2 * surfaceLayerSpacing);
    expect(resolveSurfaceLayerHeight(surface({ id: 'qreg_2', colour: 'NONE', size: [8, 8], location: [4, 0] }))).toBe(3 * surfaceLayerSpacing);
  });
});
