import { describe, expect, it } from 'vitest';

import { createSurface } from '@/three/renderer/createSurface';
import { surfaceDefaultThickness } from '@/config/constants';
import * as THREE from 'three';

describe('three/renderer/createSurface', () => {
  function worldBoundsAssumingOnlyTranslation(mesh: THREE.Mesh) {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    if (!bb) throw new Error('Expected geometry.boundingBox to be defined');
    return {
      min: bb.min.clone().add(mesh.position),
      max: bb.max.clone().add(mesh.position),
    };
  }

  it('maps render-data Z to world -Z (sign flip)', () => {
    const thickness = surfaceDefaultThickness;

    const surfacesById = new Map<string, { dimensions: number[]; coordinates: number[] }>();
    const mesh = createSurface([2, 4], [10, 20], 3, 'RED', 'surface-1', surfacesById);

    expect(mesh.position.x).toBe(10 + 2 / 2);
    expect(mesh.position.y).toBe(20 + 4 / 2);
    expect(mesh.position.z).toBe(3 + thickness / 2);

    const stored = surfacesById.get('surface-1');
    expect(stored?.coordinates).toEqual([10, 20, 3]);
  });

  it('occupies the expected world axis-aligned bounds', () => {
    const surfacesById = new Map<string, { dimensions: number[]; coordinates: number[] }>();
    const mesh = createSurface([2, 4], [10, 20], 3, 'RED', 'surface-1', surfacesById);

    const { min, max } = worldBoundsAssumingOnlyTranslation(mesh);
    expect(min.x).toBeCloseTo(10, 7);
    expect(max.x).toBeCloseTo(12, 7);
    expect(min.y).toBeCloseTo(20, 7);
    expect(max.y).toBeCloseTo(24, 7);
    expect(min.z).toBeCloseTo(3, 7);
    expect(max.z).toBeCloseTo(3 + surfaceDefaultThickness, 7);
  });
});
