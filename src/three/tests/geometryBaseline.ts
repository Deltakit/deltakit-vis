import * as fs from 'node:fs';
import * as path from 'node:path';

import * as THREE from 'three';
import { expect } from 'vitest';

type SerializableGeometry = {
  positions: number[];
  normals?: number[];
  indices?: number[];
};

function roundTo(value: number, precision: number): number {
  const p = 10 ** precision;
  const rounded = Math.round(value * p) / p;
  // Avoid "-0" in JSON output
  return Object.is(rounded, -0) ? 0 : rounded;
}

function roundArray(values: ArrayLike<number>, precision: number): number[] {
  const out = new Array<number>(values.length);
  for (let i = 0; i < values.length; i++) out[i] = roundTo(values[i], precision);
  return out;
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function serializeMeshGeometry(
  mesh: THREE.Mesh,
  options?: {
    precision?: number;
    applyWorldTransform?: boolean;
  }
): SerializableGeometry {
  const precision = options?.precision ?? 5;
  const applyWorldTransform = options?.applyWorldTransform ?? false;

  const geometry = mesh.geometry as THREE.BufferGeometry;
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
  if (!posAttr) return { positions: [] };

  const index = geometry.getIndex();
  const normalAttr = geometry.getAttribute('normal') as THREE.BufferAttribute | undefined;

  if (!applyWorldTransform) {
    // Keep geometry in local space.
    return {
      positions: roundArray(posAttr.array as ArrayLike<number>, precision),
      ...(normalAttr
        ? { normals: roundArray(normalAttr.array as ArrayLike<number>, precision) }
        : {}),
      // TypedArray -> plain array so it JSON-serializes consistently.
      ...(index ? { indices: Array.from(index.array as any as ArrayLike<number>) } : {}),
    };
  }

  // Convert vertices/normals into world space.
  mesh.updateMatrixWorld(true);
  const world = mesh.matrixWorld;
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(world);

  const positions = new Array<number>(posAttr.array.length);
  const normals = normalAttr ? new Array<number>(normalAttr.array.length) : undefined;

  const v = new THREE.Vector3();

  for (let i = 0; i < posAttr.array.length; i += 3) {
    // Positions are stored as [x,y,z,x,y,z,...].
    v.set(
      (posAttr.array as any as ArrayLike<number>)[i],
      (posAttr.array as any as ArrayLike<number>)[i + 1],
      (posAttr.array as any as ArrayLike<number>)[i + 2]
    );
    v.applyMatrix4(world);

    positions[i] = roundTo(v.x, precision);
    positions[i + 1] = roundTo(v.y, precision);
    positions[i + 2] = roundTo(v.z, precision);
  }

  if (normalAttr && normals) {
    for (let i = 0; i < normalAttr.array.length; i += 3) {
      v.set(
        (normalAttr.array as any as ArrayLike<number>)[i],
        (normalAttr.array as any as ArrayLike<number>)[i + 1],
        (normalAttr.array as any as ArrayLike<number>)[i + 2]
      );
      v.applyMatrix3(normalMatrix).normalize();

      normals[i] = roundTo(v.x, precision);
      normals[i + 1] = roundTo(v.y, precision);
      normals[i + 2] = roundTo(v.z, precision);
    }
  }

  return {
    positions,
    ...(normals ? { normals } : {}),
    ...(index ? { indices: Array.from(index.array as any as ArrayLike<number>) } : {}),
  };
}

export function expectBaselineJson(params: { baselineFile: string; data: unknown }) {
  // Resolve from repo root.
  const baselinePath = path.resolve(process.cwd(), params.baselineFile);
  ensureDir(path.dirname(baselinePath));

  if (!fs.existsSync(baselinePath)) {
    // First run. Create the baseline file.
    // Keep it minified to avoid huge multi-line snapshots.
    fs.writeFileSync(baselinePath, JSON.stringify(params.data) + '\n', 'utf8');
    expect(true).toBe(true);
    return;
  }

  // Normal run. Compare against the saved baseline.
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as unknown;
  expect(params.data).toEqual(baseline);
}
