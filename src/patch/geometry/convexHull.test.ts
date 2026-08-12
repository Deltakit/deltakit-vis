import { describe, expect, it } from 'vitest';

import { convexHull } from './convexHull';

type Point2D = [number, number];

function signedArea(pts: Point2D[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return area / 2;
}

// The Jarvis march implementation produces CW order in y-up math coordinates
// (negative signed area). All winding assertions use this helper.
function isCW(pts: Point2D[]): boolean {
  return signedArea(pts) < 0;
}

describe('patch/geometry/convexHull', () => {
  it('returns an empty array for 0 points', () => {
    expect(convexHull([])).toEqual([]);
  });

  it('returns a copy (not the same reference) for 1 point', () => {
    const pts: Point2D[] = [[3, 4]];
    const result = convexHull(pts);
    expect(result).toEqual([[3, 4]]);
    expect(result).not.toBe(pts);
  });

  it('returns a copy for 2 points', () => {
    const pts: Point2D[] = [[0, 0], [1, 1]];
    const result = convexHull(pts);
    expect(result).toEqual([[0, 0], [1, 1]]);
    expect(result).not.toBe(pts);
  });

  it('returns 3 CCW-ordered points for a non-degenerate triangle', () => {
    const hull = convexHull([[0, 0], [2, 0], [1, 2]]);
    expect(hull).toHaveLength(3);
    expect(isCW(hull)).toBe(true);
  });

  it('starts from the leftmost point for a triangle', () => {
    // Leftmost is (0, 0)
    const hull = convexHull([[0, 0], [2, 0], [1, 2]]);
    expect(hull[0]).toEqual([0, 0]);
  });

  it('breaks ties at the same x by choosing the lowest y first', () => {
    // Two points share x=0: (0,1) and (0,0). The one with y=0 should be first.
    const hull = convexHull([[0, 1], [0, 0], [2, 1]]);
    expect(hull[0]).toEqual([0, 0]);
  });

  it('returns 4 CCW-ordered hull vertices for an axis-aligned square', () => {
    const pts: Point2D[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const hull = convexHull(pts);
    expect(hull).toHaveLength(4);
    expect(isCW(hull)).toBe(true);
    for (const p of pts) {
      expect(hull.some(h => h[0] === p[0] && h[1] === p[1])).toBe(true);
    }
  });

  it('handles a typical weight-4 surface code plaquette layout', () => {
    // Four data qubits at unit-square corners (as they appear in surface codes)
    const pts: Point2D[] = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const hull = convexHull(pts);
    expect(hull).toHaveLength(4);
    expect(isCW(hull)).toBe(true);
    for (const p of pts) {
      expect(hull.some(h => h[0] === p[0] && h[1] === p[1])).toBe(true);
    }
  });

  it('excludes an interior point from the hull', () => {
    // Unit square plus a point at the center — center must not appear in hull
    const pts: Point2D[] = [[0, 0], [2, 0], [2, 2], [0, 2], [1, 1]];
    const hull = convexHull(pts);
    expect(hull).toHaveLength(4);
    expect(hull.some(p => p[0] === 1 && p[1] === 1)).toBe(false);
    expect(isCW(hull)).toBe(true);
  });

  it('keeps only the extreme endpoints when several points are collinear on an edge', () => {
    // Bottom edge: (0,0), (1,0), (2,0), (3,0) — collinear. Plus apex (1.5,2).
    const pts: Point2D[] = [[0, 0], [1, 0], [2, 0], [3, 0], [1.5, 2]];
    const hull = convexHull(pts);
    // Only the 3 extreme points: (0,0), (3,0), (1.5,2)
    expect(hull).toHaveLength(3);
    expect(hull.some(p => p[0] === 1 && p[1] === 0)).toBe(false);
    expect(hull.some(p => p[0] === 2 && p[1] === 0)).toBe(false);
    expect(isCW(hull)).toBe(true);
  });

  it('handles a non-convex set where some input points are strictly interior', () => {
    // Pentagon hull with interior noise point
    const hull = convexHull([
      [0, 0], [4, 0], [5, 3], [2, 5], [-1, 3], [2, 2], // last is interior
    ]);
    expect(hull).toHaveLength(5);
    expect(hull.some(p => p[0] === 2 && p[1] === 2)).toBe(false);
    expect(isCW(hull)).toBe(true);
  });

  it('produces a hull with the correct area magnitude for a 2×2 square', () => {
    const pts: Point2D[] = [[0, 0], [2, 0], [2, 2], [0, 2]];
    const hull = convexHull(pts);
    expect(Math.abs(signedArea(hull))).toBeCloseTo(4, 10);
  });
});
