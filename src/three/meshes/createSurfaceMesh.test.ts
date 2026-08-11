import * as THREE from 'three';
import { describe, expect, it } from 'vitest';

import { createSurfaceMesh } from '@/three/meshes/createSurfaceMesh';
import { COLOURS } from '@/config/colours';
import { Direction } from '@/primitives/Direction';

describe('three/meshes/createSurfaceMesh', () => {
  function expectAllFinite(array: ArrayLike<number>) {
    // Catch any NaN or infinite values in the geometry attributes
    for (let i = 0; i < array.length; i++) {
      expect(Number.isFinite(array[i])).toBe(true);
    }
  }

  function expectAxisAlignedUnitNormals(geometry: THREE.BufferGeometry) {
    // Test geometry correctness using normals of vertices
    const normal = geometry.getAttribute('normal') as THREE.BufferAttribute | undefined;
    expect(normal).toBeDefined();
    if (!normal) return;

    const arr = normal.array as ArrayLike<number>;
    expect(arr.length % 3).toBe(0);
    for (let i = 0; i < arr.length; i += 3) {
      const nx = arr[i];
      const ny = arr[i + 1];
      const nz = arr[i + 2];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      expect(len).toBeCloseTo(1, 6);
      expect(Math.abs(nx) + Math.abs(ny) + Math.abs(nz)).toBeCloseTo(1, 6);
    }
  }

  function expectUvsInUnitSquare(geometry: THREE.BufferGeometry) {
    // Get the texture mapping coordinates for the geometry’s vertices
    const uv = geometry.getAttribute('uv') as THREE.BufferAttribute | undefined;
    expect(uv).toBeDefined();
    if (!uv) return;

    const arr = uv.array as ArrayLike<number>;
    expect(arr.length % 2).toBe(0);
    for (let i = 0; i < arr.length; i++) {
      expect(arr[i]).toBeGreaterThanOrEqual(-1e-6);
      expect(arr[i]).toBeLessThanOrEqual(1 + 1e-6);
    }
  }

  it('positions a thin surface box at the expected center', () => {
    const thickness = 0.001;
    const mesh = createSurfaceMesh({
      dimensions: [2, 4, thickness],
      coordinates: [10, 20, 3],
      colour: 'RED',
    });

    expect(mesh.position.x).toBe(10 + 2 / 2);
    expect(mesh.position.y).toBe(20 + 4 / 2);
    expect(mesh.position.z).toBe(3 + thickness / 2);

    expect(Array.isArray(mesh.material)).toBe(true);
    const materials = mesh.material as THREE.MeshStandardMaterial[];
    expect(materials).toHaveLength(6);
    for (const mat of materials) {
      expect(mat.color.getHex()).toBe(COLOURS.RED);
    }

    const owner = mesh.userData.owner;
    expect(owner && typeof owner.removeSurface).toBe('function');
    owner.removeSurface(new Direction('Y'));
    const indices = mesh.geometry.groups.map((g) => g.materialIndex ?? -1);
    expect(indices).not.toContain(2);
  });

  it('creates a BoxGeometry with consistent attributes and bounds', () => {
    const width = 2;
    const depth = 4;
    const height = 0.001;

    const mesh = createSurfaceMesh({
      dimensions: [width, depth, height],
      coordinates: [0, 0, 0],
      colour: 'RED',
    });

    const geometry = mesh.geometry as THREE.BufferGeometry;
    expect(geometry).toBeInstanceOf(THREE.BoxGeometry);

    const position = geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    expect(position).toBeDefined();
    expect(position?.count).toBeGreaterThan(0);
    if (position) {
      expectAllFinite(position.array as ArrayLike<number>);
    }

    const index = geometry.getIndex();
    expect(index).toBeDefined();
    if (index) {
      expect(index.count % 3).toBe(0);
      expectAllFinite(index.array as ArrayLike<number>);

      // Indices should reference valid vertices
      let maxIndex = -1;
      for (let i = 0; i < index.array.length; i++) {
        const v = (index.array as any as ArrayLike<number>)[i];
        if (v > maxIndex) maxIndex = v;
      }
      expect(maxIndex).toBeLessThan(position!.count);
    }

    geometry.computeBoundingBox();
    expect(geometry.boundingBox).toBeDefined();
    const bb = geometry.boundingBox!;
    const size = new THREE.Vector3();
    bb.getSize(size);
    expect(size.x).toBeCloseTo(width, 7);
    // Convention: X=width, Y=depth, Z=height
    expect(size.y).toBeCloseTo(depth, 7);
    expect(size.z).toBeCloseTo(height, 7);

    expectAxisAlignedUnitNormals(geometry);
    expectUvsInUnitSquare(geometry);

    const border = mesh.children.find((c) => c instanceof THREE.LineSegments) as
      | THREE.LineSegments
      | undefined;
    expect(border).toBeDefined();
    const borderPos = border?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    expect(borderPos).toBeDefined();
    if (borderPos) {
      expectAllFinite(borderPos.array as ArrayLike<number>);
    }
  });
});
