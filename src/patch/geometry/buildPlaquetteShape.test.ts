import * as THREE from 'three';
import { describe, expect, it } from 'vitest';

import { buildPlaquetteShape } from './buildPlaquetteShape';
import type { PlaquetteData } from '../types';

type Point2D = [number, number];

function boundingBox(pts: THREE.Vector2[]) {
  return {
    minX: Math.min(...pts.map(p => p.x)),
    maxX: Math.max(...pts.map(p => p.x)),
    minY: Math.min(...pts.map(p => p.y)),
    maxY: Math.max(...pts.map(p => p.y)),
  };
}

function centroid(pts: THREE.Vector2[]) {
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  };
}

function makeBulkPlaquette(coords: string[]): PlaquetteData {
  return { id: 1, shape: 'square', weight: coords.length, colour: 'red', coordinates: coords };
}

function makeBoundaryPlaquette(coords: string[]): PlaquetteData {
  return { id: 2, shape: 'semicircle', weight: coords.length, colour: 'blue', coordinates: coords };
}

describe('patch/geometry/buildPlaquetteShape', () => {
  describe('polygon shapes (square plaquettes)', () => {
    it('returns a THREE.Shape instance', () => {
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [1, 0]], ['q2', [1, 1]], ['q3', [0, 1]],
      ]);
      const shape = buildPlaquetteShape(makeBulkPlaquette(['q0', 'q1', 'q2', 'q3']), qubits);
      expect(shape).toBeInstanceOf(THREE.Shape);
    });

    it('bounding box matches the qubit extents for a unit square', () => {
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [1, 0]], ['q2', [1, 1]], ['q3', [0, 1]],
      ]);
      const shape = buildPlaquetteShape(makeBulkPlaquette(['q0', 'q1', 'q2', 'q3']), qubits);
      const pts = shape.getPoints(0);
      const bb = boundingBox(pts);
      expect(bb.minX).toBeCloseTo(0, 5);
      expect(bb.maxX).toBeCloseTo(1, 5);
      expect(bb.minY).toBeCloseTo(0, 5);
      expect(bb.maxY).toBeCloseTo(1, 5);
    });

    it('bounding box matches the qubit extents for a 2×2 square', () => {
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [2, 0]], ['q2', [2, 2]], ['q3', [0, 2]],
      ]);
      const shape = buildPlaquetteShape(makeBulkPlaquette(['q0', 'q1', 'q2', 'q3']), qubits);
      const pts = shape.getPoints(0);
      const bb = boundingBox(pts);
      expect(bb.maxX - bb.minX).toBeCloseTo(2, 5);
      expect(bb.maxY - bb.minY).toBeCloseTo(2, 5);
    });

    it('builds a polygon for a square plaquette', () => {
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [1, 0]], ['q2', [1, 1]], ['q3', [0, 1]],
      ]);
      const plaquette: PlaquetteData = { id: 3, weight: 4, shape: 'square', colour: 'red', coordinates: ['q0', 'q1', 'q2', 'q3'] };
      const shape = buildPlaquetteShape(plaquette, qubits);
      expect(shape).toBeInstanceOf(THREE.Shape);
      const pts = shape.getPoints(0);
      expect(pts.length).toBeGreaterThanOrEqual(3);
    });

    it('handles qubits supplied in shuffled order and still fills the correct bounding box', () => {
      // Convex hull should reorder them regardless of input order
      const qubits = new Map<string, Point2D>([
        ['q0', [1, 1]], ['q1', [0, 0]], ['q2', [0, 1]], ['q3', [1, 0]],
      ]);
      const shape = buildPlaquetteShape(makeBulkPlaquette(['q0', 'q1', 'q2', 'q3']), qubits);
      const pts = shape.getPoints(0);
      const bb = boundingBox(pts);
      expect(bb.minX).toBeCloseTo(0, 5);
      expect(bb.maxX).toBeCloseTo(1, 5);
      expect(bb.minY).toBeCloseTo(0, 5);
      expect(bb.maxY).toBeCloseTo(1, 5);
    });
  });

  describe('semicircle shapes (boundary plaquettes)', () => {
    it('returns a THREE.Shape instance', () => {
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [2, 0]], ['q2', [1, 1]],
      ]);
      const shape = buildPlaquetteShape(makeBoundaryPlaquette(['q0', 'q1', 'q2']), qubits);
      expect(shape).toBeInstanceOf(THREE.Shape);
    });

    it('produces an upward-bulging shape when the third qubit is above the horizontal diameter', () => {
      // Horizontal pair: q0(0,0) and q1(2,0) at y=0. Third q2(1,1) is above.
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [2, 0]], ['q2', [1, 1]],
      ]);
      const shape = buildPlaquetteShape(makeBoundaryPlaquette(['q0', 'q1', 'q2']), qubits);
      const pts = shape.getPoints(64);
      expect(centroid(pts).y).toBeGreaterThan(0);
    });

    it('produces a downward-bulging shape when the third qubit is below the horizontal diameter', () => {
      // Horizontal pair: q0(0,0) and q1(2,0) at y=0. Third q2(1,-1) is below.
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [2, 0]], ['q2', [1, -1]],
      ]);
      const shape = buildPlaquetteShape(makeBoundaryPlaquette(['q0', 'q1', 'q2']), qubits);
      const pts = shape.getPoints(64);
      expect(centroid(pts).y).toBeLessThan(0);
    });

    it('produces a rightward-bulging shape when the third qubit is to the right of the vertical diameter', () => {
      // Vertical pair: q0(0,0) and q1(0,2) at x=0. Third q2(1,1) is to the right.
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [0, 2]], ['q2', [1, 1]],
      ]);
      const shape = buildPlaquetteShape(makeBoundaryPlaquette(['q0', 'q1', 'q2']), qubits);
      const pts = shape.getPoints(64);
      expect(centroid(pts).x).toBeGreaterThan(0);
    });

    it('produces a leftward-bulging shape when the third qubit is to the left of the vertical diameter', () => {
      // Vertical pair: q0(0,0) and q1(0,2) at x=0. Third q2(-1,1) is to the left.
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [0, 2]], ['q2', [-1, 1]],
      ]);
      const shape = buildPlaquetteShape(makeBoundaryPlaquette(['q0', 'q1', 'q2']), qubits);
      const pts = shape.getPoints(64);
      expect(centroid(pts).x).toBeLessThan(0);
    });

    it('picks the right pair when p0 and p2 share the axis (middle branch)', () => {
      // p0(0,0) and p2(2,0) are the horizontal pair; p1(1,1) is the third.
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [1, 1]], ['q2', [2, 0]],
      ]);
      const shape = buildPlaquetteShape(makeBoundaryPlaquette(['q0', 'q1', 'q2']), qubits);
      const pts = shape.getPoints(64);
      // Third (q1) is above y=0 → upward bulge
      expect(centroid(pts).y).toBeGreaterThan(0);
    });

    it('picks the right pair when p1 and p2 share the axis (fallback branch)', () => {
      // p0(1,1) is the third; p1(0,0) and p2(2,0) are the horizontal pair.
      const qubits = new Map<string, Point2D>([
        ['q0', [1, 1]], ['q1', [0, 0]], ['q2', [2, 0]],
      ]);
      const shape = buildPlaquetteShape(makeBoundaryPlaquette(['q0', 'q1', 'q2']), qubits);
      const pts = shape.getPoints(64);
      // Third (q0) is above y=0 → upward bulge
      expect(centroid(pts).y).toBeGreaterThan(0);
    });

    it('semicircle height equals the radius (half the diameter distance)', () => {
      // Pair at (0,0) and (4,0): center (2,0), r=2. Upward bulge max y should be 2.
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [4, 0]], ['q2', [2, 1]],
      ]);
      const shape = buildPlaquetteShape(makeBoundaryPlaquette(['q0', 'q1', 'q2']), qubits);
      const pts = shape.getPoints(128);
      const bb = boundingBox(pts);
      expect(bb.minX).toBeCloseTo(0, 3);
      expect(bb.maxX).toBeCloseTo(4, 3);
      expect(bb.minY).toBeCloseTo(0, 3);
      expect(bb.maxY).toBeCloseTo(2, 1); // r = diameter/2 = 4/2 = 2
    });

    it('shape stays flat along the diameter — no y-extent on the wrong side', () => {
      // Upward semicircle: all sample points should have y >= 0
      const qubits = new Map<string, Point2D>([
        ['q0', [0, 0]], ['q1', [2, 0]], ['q2', [1, 1]],
      ]);
      const shape = buildPlaquetteShape(makeBoundaryPlaquette(['q0', 'q1', 'q2']), qubits);
      const pts = shape.getPoints(64);
      for (const p of pts) {
        expect(p.y).toBeGreaterThanOrEqual(-1e-6);
      }
    });
  });
});
