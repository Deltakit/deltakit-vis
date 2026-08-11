import * as THREE from 'three';
import { describe, expect, it } from 'vitest';

import { createSidesMesh } from '@/three/meshes/createSidesMesh';
import { COLOURS } from '@/config/colours';
import { Direction } from '@/primitives/Direction';

describe('three/meshes/createSidesMesh', () => {
  function expectAllFinite(array: ArrayLike<number>) {
    // Catch any NaN or infinite values in the geometry attributes
    for (let i = 0; i < array.length; i++) {
      expect(Number.isFinite(array[i])).toBe(true);
    }
  }

  it('creates a box with top/bottom material groups removed', () => {
    const mesh = createSidesMesh({
      dimensions: [2, 3, 5],
      coordinates: [0, 0, 1],
      colourScheme: ['RED', 'BLUE'],
      sides: { '+X': true, '-X': true, '+Y': true, '-Y': true },
    });

    const geometry = mesh.geometry;
    expect(geometry.groups.length).toBeGreaterThan(0);
    const indices = geometry.groups.map((g) => g.materialIndex ?? -1);
    expect(indices).not.toContain(4);
    expect(indices).not.toContain(5);
  });

  it('supports removing additional faces via owner.removeSurface', () => {
    const mesh = createSidesMesh({
      dimensions: [2, 3, 5],
      coordinates: [0, 0, 1],
      colourScheme: ['RED', 'BLUE'],
      sides: { '+X': true, '-X': true, '+Y': true, '-Y': true },
    });

    const owner = mesh.userData.owner;
    expect(owner && typeof owner.removeSurface).toBe('function');

    owner.removeSurface(new Direction('X'));
    const indicesAfter = mesh.geometry.groups.map((g) => g.materialIndex ?? -1);
    expect(indicesAfter).not.toContain(0);
  });

  it('sets hidden sides to transparent and keeps visible sides opaque', () => {
    const mesh = createSidesMesh({
      dimensions: [2, 3, 5],
      coordinates: [0, 0, 1],
      colourScheme: ['RED', 'BLUE'],
      sides: { '+X': false, '-X': true, '+Y': true, '-Y': false },
    });

    const materials = mesh.material as THREE.MeshStandardMaterial[];
    // hidden: +X (0) and -X (1)
    expect(materials[0].visible).toBe(false);
    expect(materials[1].visible).toBe(true);
    // visible: -Y (2) and +Y (3)
    expect(materials[2].visible).toBe(true);
    expect(materials[3].visible).toBe(false);
  });

  it('applies correct colours and full opacity when all sides are visible', () => {
    const mesh = createSidesMesh({
      dimensions: [2, 3, 5],
      coordinates: [0, 0, 1],
      colourScheme: ['RED', 'BLUE'],
      sides: { '+X': true, '-X': true, '+Y': true, '-Y': true },
    });

    const materials = mesh.material as THREE.MeshStandardMaterial[];
    expect(materials[0].color.getHex()).toBe(COLOURS.RED);
    expect(materials[1].color.getHex()).toBe(COLOURS.RED);
    expect(materials[2].color.getHex()).toBe(COLOURS.BLUE);
    expect(materials[3].color.getHex()).toBe(COLOURS.BLUE);

    for (const idx of [0, 1, 2, 3]) {
      expect(materials[idx].opacity).toBe(1);
      expect(materials[idx].transparent).toBe(false);
    }
  });

  it('produces a BoxGeometry with only 4 render groups (+/-X, +/-Y)', () => {
    const width = 2;
    const depth = 3;
    const height = 5;

    const mesh = createSidesMesh({
      dimensions: [width, depth, height],
      coordinates: [0, 0, 0],
      colourScheme: ['RED', 'BLUE'],
      sides: { '+X': true, '-X': true, '+Y': true, '-Y': true },
    });

    const geometry = mesh.geometry as THREE.BufferGeometry;
    expect(geometry).toBeInstanceOf(THREE.BoxGeometry);

    // BoxGeometry defaults to 6 face groups; sides mesh removes +/-Z (top/bottom), leaving 4.
    expect(geometry.groups).toHaveLength(4);
    const materialIndices = geometry.groups.map((g) => g.materialIndex ?? -1).sort();
    expect(materialIndices).toEqual([0, 1, 2, 3]);
    for (const g of geometry.groups) {
      // Each face group is two triangles (6 indices)
      expect(g.count).toBe(6);
    }

    const position = geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    expect(position).toBeDefined();
    if (position) expectAllFinite(position.array as ArrayLike<number>);

    const index = geometry.getIndex();
    expect(index).toBeDefined();
    if (index && position) {
      expectAllFinite(index.array as ArrayLike<number>);
      let maxIndex = -1;
      for (let i = 0; i < index.array.length; i++) {
        const v = (index.array as any as ArrayLike<number>)[i];
        if (v > maxIndex) maxIndex = v;
      }
      expect(maxIndex).toBeLessThan(position.count);
    }

    geometry.computeBoundingBox();
    const bb = geometry.boundingBox!;
    const size = new THREE.Vector3();
    bb.getSize(size);
    expect(size.x).toBeCloseTo(width, 7);
    // Convention: X(red)=width, Y=depth(red), Z=height(blue)
    expect(size.y).toBeCloseTo(depth, 7);
    expect(size.z).toBeCloseTo(height, 7);

    // Border edges should be attached
    const hasBorder = mesh.children.some((c) => c instanceof THREE.LineSegments);
    expect(hasBorder).toBe(true);
  });
});
