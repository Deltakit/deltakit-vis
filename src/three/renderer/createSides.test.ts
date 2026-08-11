import { describe, expect, it } from 'vitest';

import { createSurface } from '@/three/renderer/createSurface';
import { createSides } from '@/three/renderer/createSides';
import * as THREE from 'three';

describe('three/renderer/createSides', () => {
  function worldBoundsAssumingOnlyTranslation(mesh: THREE.Mesh) {
    // Helper funciton to compute the world-space axis-aligned bounding box of a mesh.
    const geometry = mesh.geometry as THREE.BufferGeometry;
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    if (!bb) throw new Error('Expected geometry.boundingBox to be defined');
    return {
      min: bb.min.clone().add(mesh.position),
      max: bb.max.clone().add(mesh.position),
    };
  }

  it('positions mesh using stored surface coordinates with string IDs', () => {
    const surfacesById = new Map<string, { dimensions: number[]; coordinates: number[] }>();

    createSurface([3, 5], [1, 2], 0, 'BLUE', 'from', surfacesById);
    createSurface([3, 5], [1, 2], 6, 'BLUE', 'to', surfacesById);

    const mesh = createSides('from', 'to', ['RED', 'BLUE'], surfacesById, { '+X': true, '-X': true, '+Y': true, '-Y': true }, 'side-1');

    expect(mesh.position.x).toBe(1 + 3 / 2);
    expect(mesh.position.y).toBe(2 + 5 / 2);
    expect(mesh.userData.id).toBe('side-1');
  });

  it('throws when a surface ID is missing', () => {
    const surfacesById = new Map<string, { dimensions: number[]; coordinates: number[] }>();

    createSurface([2, 4], [10, 20], 0, 'RED', 'id-1', surfacesById);

    expect(() =>
      createSides('id-1', 'missing', ['RED', 'BLUE'], surfacesById, { '+X': true, '-X': true, '+Y': true, '-Y': true })
    ).toThrow('missing surfaces');
  });

  it('omits userData.id when id is not provided', () => {
    const surfacesById = new Map<string, { dimensions: number[]; coordinates: number[] }>();

    createSurface([2, 4], [10, 20], 0, 'RED', 'id-1', surfacesById);
    createSurface([2, 4], [10, 20], 5, 'RED', 'id-2', surfacesById);

    const mesh = createSides('id-1', 'id-2', ['RED', 'BLUE'], surfacesById, { '+X': true, '-X': true, '+Y': true, '-Y': true });

    expect(mesh.userData.id).toBeUndefined();
  });

  it('occupies the expected world axis-aligned bounds', () => {
    const surfacesById = new Map<string, { dimensions: number[]; coordinates: number[] }>();
    createSurface([2, 4], [10, 20], 3, 'RED', 'from', surfacesById);
    createSurface([2, 4], [10, 20], 9, 'RED', 'to', surfacesById);

    const side = createSides('from', 'to', ['BLUE', 'RED'], surfacesById, { '+X': true, '-X': true, '+Y': true, '-Y': true });
    const { min, max } = worldBoundsAssumingOnlyTranslation(side);

    // Footprint matches from-surface X/Y.
    expect(min.x).toBeCloseTo(10, 7);
    expect(max.x).toBeCloseTo(12, 7);
    expect(min.y).toBeCloseTo(20, 7);
    expect(max.y).toBeCloseTo(24, 7);

    // Spans from startHeight=min(3,9)=3 to 9.
    expect(min.z).toBeCloseTo(3, 7);
    expect(max.z).toBeCloseTo(9, 7);
  });
});
