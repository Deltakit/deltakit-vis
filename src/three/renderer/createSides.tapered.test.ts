import * as THREE from 'three';
import { describe, expect, it } from 'vitest';

import { createSides } from '@/three/renderer/createSides';
import type { SurfaceInfo } from '@/types/three';

const ALL_SIDES = { '+X': true, '-X': true, '+Y': true, '-Y': true } as const;

describe('three/renderer/createSides - tapered geometry corner connection', () => {
  /** The eight hull corners: the four `from` corners followed by the four `to` corners. */
  function hullCorners(mesh: THREE.Mesh) {
    const position = mesh.geometry.getAttribute('position');
    expect(position).toBeDefined();

    const vertices: THREE.Vector3[] = [];
    for (let i = 0; i < position.count; i++) {
      vertices.push(new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i)));
    }
    return { from: vertices.slice(0, 4), to: vertices.slice(4, 8) };
  }

  it('connects shrink surface corners with oblique sides', () => {
    const surfacesById = new Map<string, SurfaceInfo>([
      ['gen_id_1', { dimensions: [12, 12, 0.001], coordinates: [0, 0, 4] }],
      ['qreg_3', { dimensions: [9, 9, 0.001], coordinates: [0, 0, 6] }],
    ]);

    const mesh = createSides('gen_id_1', 'qreg_3', ['RED', 'BLUE'], surfacesById, { ...ALL_SIDES });

    expect(mesh.geometry).not.toBeInstanceOf(THREE.BoxGeometry);

    const { from, to } = hullCorners(mesh);
    expect((mesh.geometry as THREE.BufferGeometry).getAttribute('position').count).toBe(8);

    expect(from[0].x).toBeCloseTo(0, 5);
    expect(from[0].y).toBeCloseTo(0, 5);
    expect(to[0].x).toBeCloseTo(0, 5);
    expect(to[0].y).toBeCloseTo(0, 5);

    expect(from[1].x).toBeCloseTo(12, 5);
    expect(from[1].y).toBeCloseTo(0, 5);
    expect(to[1].x).toBeCloseTo(9, 5);
    expect(to[1].y).toBeCloseTo(0, 5);

    expect(mesh.position.z).toBeCloseTo(4, 5);
  });

  it('handles grow operation with location offset', () => {
    const surfacesById = new Map<string, SurfaceInfo>([
      ['from', { dimensions: [3, 3, 0.001], coordinates: [1, 1, 0] }],
      ['to', { dimensions: [4, 4, 0.001], coordinates: [0.5, 0.5, 2] }],
    ]);

    const mesh = createSides('from', 'to', ['RED', 'BLUE'], surfacesById, { ...ALL_SIDES });

    const { from, to } = hullCorners(mesh);

    expect(from[0].x).toBeCloseTo(1, 5);
    expect(from[0].y).toBeCloseTo(1, 5);
    expect(from[1].x).toBeCloseTo(4, 5);
    expect(from[1].y).toBeCloseTo(1, 5);

    expect(to[0].x).toBeCloseTo(0.5, 5);
    expect(to[0].y).toBeCloseTo(0.5, 5);
    expect(to[1].x).toBeCloseTo(4.5, 5);
    expect(to[1].y).toBeCloseTo(0.5, 5);
  });
});
