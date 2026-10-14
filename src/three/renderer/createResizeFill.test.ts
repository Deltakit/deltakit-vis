import { describe, expect, it } from 'vitest';
import * as THREE from 'three';

import { createSurface } from '@/three/renderer/createSurface';
import { createResizeFill } from '@/three/renderer/createResizeFill';
import { colourToHex } from '@/config/colours';
import type { SurfaceInfo } from '@/types/three';

describe('three/renderer/createResizeFill', () => {
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

  function meshColourHex(mesh: THREE.Mesh): number {
    const material = mesh.material as THREE.MeshBasicMaterial;
    return material.color.getHex();
  }

  function topFaceArea(mesh: THREE.Mesh): number {
    const position = mesh.geometry.getAttribute('position');

    let total = 0;
    for (let i = 0; i < position.count; i += 3) {
      total += Math.abs(
        (position.getX(i + 1) - position.getX(i)) * (position.getY(i + 2) - position.getY(i)) -
          (position.getX(i + 2) - position.getX(i)) * (position.getY(i + 1) - position.getY(i))
      ) / 2;
    }
    return total / 2;
  }

  it('covers the growth area with one polygon per growth direction', () => {
    const surfacesById = new Map<string, SurfaceInfo>();

    createSurface([2, 2], [0, 0], 4, 'BLUE', 'from', surfacesById);
    createSurface([4, 4], [-1, -1], 4, 'BLUE', 'to', surfacesById);

    const meshes = createResizeFill('from', 'to', surfacesById, 'resize-1');

    expect(meshes.every((mesh) => mesh.userData.meshType === 'resize')).toBe(true);
    expect(meshes[0].userData.id).toContain('resize-1:');

    const minsX = meshes.map((m) => worldBoundsAssumingOnlyTranslation(m).min.x);
    const maxsX = meshes.map((m) => worldBoundsAssumingOnlyTranslation(m).max.x);
    const minsY = meshes.map((m) => worldBoundsAssumingOnlyTranslation(m).min.y);
    const maxsY = meshes.map((m) => worldBoundsAssumingOnlyTranslation(m).max.y);

    expect(Math.min(...minsX)).toBeCloseTo(-1, 7);
    expect(Math.max(...maxsX)).toBeCloseTo(3, 7);
    expect(Math.min(...minsY)).toBeCloseTo(-1, 7);
    expect(Math.max(...maxsY)).toBeCloseTo(3, 7);

    const colours = new Set(meshes.map(meshColourHex));
    expect(colours.has(colourToHex('BLUE'))).toBe(true);
    expect(colours.has(colourToHex('RED'))).toBe(true);

    // A ring grow mitres into four trapezoids: two for X, two for Y.
    const regions = meshes.map((mesh) => mesh.userData.resizeRegion);
    expect(regions.filter((region) => region === 'x-growth')).toHaveLength(2);
    expect(regions.filter((region) => region === 'y-growth')).toHaveLength(2);

    // X growth takes the contrasting colour, Y growth the surface's own colour.
    const colourByRegion = new Map(
      meshes.map((mesh) => [mesh.userData.resizeRegion, meshColourHex(mesh)])
    );
    expect(colourByRegion.get('x-growth')).toBe(colourToHex('RED'));
    expect(colourByRegion.get('y-growth')).toBe(colourToHex('BLUE'));

    // The two coloured regions tile the ring exactly: 4x4 minus the 2x2 core.
    expect(meshes.reduce((sum, mesh) => sum + topFaceArea(mesh), 0)).toBeCloseTo(12, 7);

    expect(
      meshes.every((mesh) => mesh.children.some((child) => child instanceof THREE.LineSegments))
    ).toBe(true);
  });

  it('fills the connector gap when resize surfaces do not overlap', () => {
    const surfacesById = new Map<string, SurfaceInfo>();

    createSurface([2, 2], [0, 0], 0, 'RED', 'from', surfacesById);
    createSurface([2, 2], [5, 5], 0, 'RED', 'to', surfacesById);

    const meshes = createResizeFill('from', 'to', surfacesById);

    expect(meshes).toHaveLength(1);
    const { min, max } = worldBoundsAssumingOnlyTranslation(meshes[0]);
    expect(min.x).toBeCloseTo(2, 7);
    expect(max.x).toBeCloseTo(5, 7);
    expect(min.y).toBeCloseTo(2, 7);
    expect(max.y).toBeCloseTo(5, 7);
  });

  it('covers the changed area when the surfaces only partially overlap', () => {
    const surfacesById = new Map<string, SurfaceInfo>();

    createSurface([2, 2], [0, 0], 0, 'BLUE', 'from', surfacesById);
    createSurface([2, 2], [1, 1], 0, 'BLUE', 'to', surfacesById);

    const meshes = createResizeFill('from', 'to', surfacesById);

    // Union (7) minus the 1x1 overlap (1) that did not change.
    expect(meshes.reduce((sum, mesh) => sum + topFaceArea(mesh), 0)).toBeCloseTo(6, 7);
    expect(meshes.map((mesh) => mesh.userData.resizeRegion).sort()).toEqual([
      'x-growth',
      'x-growth',
      'y-growth',
      'y-growth',
    ]);
  });

  it('uses fallback colour when neither surface has a visible colour', () => {
    const surfacesById = new Map<string, SurfaceInfo>();

    createSurface([2, 2], [0, 0], 0, 'NONE', 'from', surfacesById);
    createSurface([4, 4], [-1, -1], 0, 'NONE', 'to', surfacesById);

    const meshes = createResizeFill('from', 'to', surfacesById);

    expect(meshes.length).toBeGreaterThan(0);
    expect(meshes.every((mesh) => mesh.userData.meshType === 'resize')).toBe(true);
    const colours = new Set(meshes.map(meshColourHex));
    expect(colours.has(colourToHex('BLUE'))).toBe(true);
    expect(colours.has(colourToHex('RED'))).toBe(true);
  });
});
