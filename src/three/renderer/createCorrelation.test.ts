import * as THREE from 'three';
import { describe, expect, it } from 'vitest';

import { createCorrelation } from '@/three/renderer/createCorrelation';
import { createSides } from '@/three/renderer/createSides';
import type { CorrelationOp, SideOp } from '@/types/renderData';

describe('three/renderer/createCorrelation', () => {
  const surfaces = new Map([
    ['from', { coordinates: [0, 0, 0], dimensions: [4, 6, 0.001] }],
    ['to', { coordinates: [0, 0, 8], dimensions: [4, 6, 0.001] }],
  ]);
  const block: SideOp = {
    type: 'side', id: 'block', op_name: 'log_asm.meas_stab',
    fromSurfaceId: 'from', toSurfaceId: 'to',
    colourScheme: ['BLUE', 'RED'],
    sides: { '+X': true, '-X': true, '+Y': true, '-Y': true },
  };
  const sides = new Map([[block.id, block]]);
  const correlation: CorrelationOp = {
    type: 'correlation', blockId: 'block', surfaces: ['Z-Y', 'Z+Y'], colour: 'BLUE',
  };

  it.each([
    ['X+Y', [0, 3, 4], [4, 6, 4]],
    ['X-Y', [0, 0, 4], [4, 3, 4]],
    ['Y+X', [2, 0, 4], [4, 6, 4]],
    ['Y-X', [0, 0, 4], [2, 6, 4]],
    ['X+Z', [0, 3, 4], [4, 3, 8]],
    ['X-Z', [0, 3, 0], [4, 3, 4]],
    ['Z+X', [2, 3, 0], [4, 3, 8]],
    ['Z-X', [0, 3, 0], [2, 3, 8]],
    ['Y+Z', [2, 0, 4], [2, 6, 8]],
    ['Y-Z', [2, 0, 0], [2, 6, 4]],
    ['Z+Y', [2, 3, 0], [2, 6, 8]],
    ['Z-Y', [2, 0, 0], [2, 3, 8]],
  ])('renders %s with a full first axis and signed half second axis', (surface, min, max) => {
    const [mesh] = createCorrelation({ ...correlation, surfaces: [surface] }, surfaces, sides);
    mesh.geometry.computeBoundingBox();
    expect(mesh.geometry.boundingBox?.min.toArray()).toEqual(min);
    expect(mesh.geometry.boundingBox?.max.toArray()).toEqual(max);
    expect(mesh.geometry.getIndex()?.count).toBe(6);
    const normals = mesh.geometry.getAttribute('normal');
    for (let i = 0; i < normals.count; i++) {
      expect(new THREE.Vector3().fromBufferAttribute(normals, i).length()).toBeCloseTo(1);
    }
  });

  it('resolves blockId and preserves material, colour and normal occlusion', () => {
    const [mesh] = createCorrelation({ ...correlation, colour: 'RED' }, surfaces, sides);
    mesh.geometry.computeBoundingBox();
    expect(mesh.geometry.boundingBox?.min.toArray()).toEqual([2, 0, 0]);
    expect(mesh.geometry.boundingBox?.max.toArray()).toEqual([2, 6, 8]);
    expect(mesh.userData).toMatchObject({ meshType: 'correlation', blockId: 'block' });
    expect(mesh.material).toMatchObject({
      transparent: true, opacity: 0.7, depthWrite: false, depthTest: true,
      side: THREE.DoubleSide, wireframe: false,
    });
    const [blueMesh] = createCorrelation(correlation, surfaces, sides);
    expect((mesh.material as THREE.MeshBasicMaterial).color.equals(
      (blueMesh.material as THREE.MeshBasicMaterial).color
    )).toBe(false);
    expect(mesh.children).toHaveLength(0);
  });

  it('connects XY and YZ sheets along their common central edge', () => {
    const [mesh] = createCorrelation({ ...correlation, surfaces: ['X+Y', 'Z+Y'] }, surfaces, sides);
    expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual([
      0, 3, 4, 0, 6, 4, 4, 6, 4, 4, 3, 4,
      2, 3, 0, 2, 6, 0, 2, 6, 8, 2, 3, 8,
    ]);
  });

  it('deduplicates whitespace variants but keeps different axis orders', () => {
    const [mesh] = createCorrelation({
      ...correlation, surfaces: ['X+Y', ' X + Y ', 'X +Y', 'Y+X'],
    }, surfaces, sides);
    expect(mesh.geometry.getAttribute('position').count).toBe(8);
    expect(mesh.geometry.getIndex()?.count).toBe(12);
  });

  it('places the reported elevated Y+X surface at exactly half block height', () => {
    const elevated = new Map([
      ['from', { coordinates: [0, 4, 18.01], dimensions: [3, 3, 0.001] }],
      ['to', { coordinates: [0, 4, 21], dimensions: [3, 3, 0.001] }],
    ]);
    const [mesh] = createCorrelation({ ...correlation, surfaces: ['Y+X'] }, elevated, sides);
    const vertices = mesh.geometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
      expect(vertices.getZ(i)).toBeCloseTo(19.505, 5);
    }
  });

  it.each([false, true])('interpolates offset, tapered blocks (reversed=%s)', (reversed) => {
    const tapered = new Map([
      ['from', { coordinates: [0, 0, 0], dimensions: [2, 4, 0.001] }],
      ['to', { coordinates: [2, 2, 4], dimensions: [4, 2, 0.001] }],
    ]);
    const sideMap = reversed
      ? new Map([['block', { ...block, fromSurfaceId: 'to', toSurfaceId: 'from' }]])
      : sides;
    const [horizontal] = createCorrelation({ ...correlation, surfaces: ['Y+X'] }, tapered, sideMap);
    horizontal.geometry.computeBoundingBox();
    expect(horizontal.geometry.boundingBox?.min.toArray()).toEqual([2.5, 1, 2]);
    expect(horizontal.geometry.boundingBox?.max.toArray()).toEqual([4, 4, 2]);
    const [upper] = createCorrelation({ ...correlation, surfaces: ['X+Z'] }, tapered, sideMap);
    expect(Array.from(upper.geometry.getAttribute('position').array)).toEqual([
      1, 2.5, 2, 2, 3, 4, 6, 3, 4, 4, 2.5, 2,
    ]);
  });

  it('uses the side bounding-box union for offset blocks of equal size', () => {
    const offset = new Map([
      ['from', { coordinates: [0, 0, 0], dimensions: [4, 6, 0.001] }],
      ['to', { coordinates: [2, 2, 8], dimensions: [4, 6, 0.001] }],
    ]);
    const [mesh] = createCorrelation({ ...correlation, surfaces: ['X+Y'] }, offset, sides);
    mesh.geometry.computeBoundingBox();
    expect(mesh.geometry.boundingBox?.min.toArray()).toEqual([0, 4, 4]);
    expect(mesh.geometry.boundingBox?.max.toArray()).toEqual([6, 8, 4]);
  });

  it.each([false, true])('uses signed world Z boundaries with reversed endpoints=%s', (reversed) => {
    const sideMap = reversed
      ? new Map([['block', { ...block, fromSurfaceId: 'to', toSurfaceId: 'from' }]])
      : sides;
    for (const [surface, min, max] of [['X+Z', 4, 8], ['X-Z', 0, 4]] as const) {
      const [mesh] = createCorrelation({ ...correlation, surfaces: [surface] }, surfaces, sideMap);
      mesh.geometry.computeBoundingBox();
      expect(mesh.geometry.boundingBox?.min.z).toBe(min);
      expect(mesh.geometry.boundingBox?.max.z).toBe(max);
    }
  });

  it('matches side height for coincident endpoints', () => {
    const flat = new Map([['from', surfaces.get('from')!], ['to', surfaces.get('from')!]]);
    const side = createSides('from', 'to', block.colourScheme, flat, block.sides);
    const [mesh] = createCorrelation({ ...correlation, surfaces: ['X+Y'] }, flat, sides);
    const vertices = mesh.geometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
      expect(vertices.getZ(i)).toBeCloseTo(side.position.z, 10);
    }
  });

  it.each(['X+X', 'Y-ZZ', 'x+y', '+X', 'X/Y', '', 'X++Y', 'W+Y'])('rejects invalid surface %j', (surface) => {
    expect(() => createCorrelation({ ...correlation, surfaces: [surface] }, surfaces, sides))
      .toThrow('invalid surface');
  });

  it.each([[], undefined, null, 'X+Y', [42], [{}]])('rejects invalid runtime surfaces %j', (value) => {
    const payload = JSON.parse(JSON.stringify({ ...correlation, surfaces: value }));
    expect(() => createCorrelation(payload, surfaces, sides)).toThrow('Unable to create correlation:');
  });

  it('rejects the removed directions schema explicitly', () => {
    const payload = JSON.parse('{"type":"correlation","blockId":"block","colour":"BLUE","directions":[{"orientation":"horizontal","direction":"+X"}]}');
    expect(() => createCorrelation(payload, surfaces, sides)).toThrow('surfaces must be a non-empty array');
  });

  it('reports a missing side', () => {
    expect(() => createCorrelation(correlation, surfaces, new Map()))
      .toThrow('missing side for blockId=block');
  });

  it('reports missing surface endpoints', () => {
    expect(() => createCorrelation(correlation, new Map(), sides))
      .toThrow('missing surfaces for IDs from=from to=to');
  });
});
