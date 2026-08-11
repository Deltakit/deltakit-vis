import * as THREE from 'three';
import type { PlaquetteData } from '../types';
import { convexHull } from './convexHull';

type Point2D = [number, number];

const TOLERANCE = 0.001;

export function buildPlaquetteShape(
  plaquette: PlaquetteData,
  qubitMap: Map<string, Point2D>,
): THREE.Shape {
  const points = plaquette.coordinates.map(id => qubitMap.get(id)!);
  return plaquette.shape === 'semicircle' ? buildSemicircleShape(points) : buildPolygonShape(points);
}

function buildPolygonShape(points: Point2D[]): THREE.Shape {
  const hull = convexHull(points);
  const shape = new THREE.Shape();
  shape.moveTo(hull[0][0], hull[0][1]);
  for (let i = 1; i < hull.length; i++) {
    shape.lineTo(hull[i][0], hull[i][1]);
  }
  shape.closePath();
  return shape;
}

function buildSemicircleShape(points: Point2D[]): THREE.Shape {
  const [p0, p1, p2] = points;
  let pairA: Point2D, pairB: Point2D, third: Point2D;

  // Find the two qubits that share an axis — they form the diameter.
  if (Math.abs(p0[1] - p1[1]) < TOLERANCE || Math.abs(p0[0] - p1[0]) < TOLERANCE) {
    [pairA, pairB, third] = [p0, p1, p2];
  } else if (Math.abs(p0[1] - p2[1]) < TOLERANCE || Math.abs(p0[0] - p2[0]) < TOLERANCE) {
    [pairA, pairB, third] = [p0, p2, p1];
  } else {
    [pairA, pairB, third] = [p1, p2, p0];
  }

  const cx = (pairA[0] + pairB[0]) / 2;
  const cy = (pairA[1] + pairB[1]) / 2;
  const r = Math.sqrt((pairB[0] - pairA[0]) ** 2 + (pairB[1] - pairA[1]) ** 2) / 2;
  const isHorizontal = Math.abs(pairA[1] - pairB[1]) < TOLERANCE;

  const shape = new THREE.Shape();

  if (isHorizontal) {
    const leftX = Math.min(pairA[0], pairB[0]);
    const rightX = Math.max(pairA[0], pairB[0]);
    const towardPositiveY = third[1] > cy;

    shape.moveTo(leftX, cy);
    shape.lineTo(rightX, cy);
    // CCW (clockwise=false): arc 0→π passes through +y (upward bulge).
    // CW  (clockwise=true):  arc 0→π passes through -y (downward bulge).
    shape.absarc(cx, cy, r, 0, Math.PI, !towardPositiveY);
  } else {
    const bottomY = Math.min(pairA[1], pairB[1]);
    const topY = Math.max(pairA[1], pairB[1]);
    const towardPositiveX = third[0] > cx;

    shape.moveTo(cx, bottomY);
    shape.lineTo(cx, topY);
    // CW  (clockwise=true):  arc π/2→-π/2 passes through +x (rightward bulge).
    // CCW (clockwise=false): arc π/2→-π/2 passes through -x (leftward bulge).
    shape.absarc(cx, cy, r, Math.PI / 2, -Math.PI / 2, towardPositiveX);
  }

  shape.closePath();
  return shape;
}
