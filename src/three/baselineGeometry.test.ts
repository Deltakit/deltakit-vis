import * as THREE from 'three';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'vitest';

import { createSides } from '@/three/renderer/createSides';
import { createSurface } from '@/three/renderer/createSurface';
import type { Op } from '@/types/renderData';
import { expectBaselineJson, serializeMeshGeometry } from '@/three/tests/geometryBaseline';

type SurfaceInfo = { dimensions: number[]; coordinates: number[] };

type ExampleFile = {
  ops: Op[];
};

function listExampleJsonFiles(): string[] {
  const examplesDir = path.resolve(process.cwd(), 'public/examples');
  if (!fs.existsSync(examplesDir)) return [];
  const entries = fs.readdirSync(examplesDir, { recursive: true, encoding: 'utf8' });
  return entries
    .filter((f): f is string => typeof f === 'string' && f.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));
}

function readExampleFile(fileName: string): ExampleFile {
  const filePath = path.resolve(process.cwd(), 'public/examples', fileName);
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Example ${fileName} did not parse to an object`);
  }
  const ops = (parsed as any).ops as unknown;
  if (!Array.isArray(ops)) {
    throw new Error(`Example ${fileName} is missing an 'ops' array`);
  }
  return { ops: ops as Op[] };
}

function baselinePathForExample(fileName: string): string {
  // Keep subfolder structure in the tests folder in root of project.
  // Example: extended/cnot.json -> tests/geometry_baselines/extended/cnot.scene.geometry.json
  const withoutExt = fileName.slice(0, -path.extname(fileName).length);
  const normalized = withoutExt.split(path.sep).join('/');
  return `tests/geometry_baselines/${normalized}.scene.geometry.json`;
}

describe('three/rendering geometry baselines (public/examples/**/*.json)', () => {
  const exampleFiles = listExampleJsonFiles();

  it('finds at least one example JSON', () => {
    if (exampleFiles.length === 0) {
      throw new Error('No example JSON files found in public/examples');
    }
  });

  it.each(exampleFiles)('%s matches the stored baseline JSON (or creates it if missing)', (fileName) => {
    const { ops } = readExampleFile(fileName);

    const surfacesById = new Map<string, SurfaceInfo>();
    const meshesByKey = new Map<string, THREE.Mesh>();

    // Build surfaces first so sides can reference them.
    for (const op of ops) {
      if (op.type !== 'surface') continue;
      if (!op.id) continue;
      const mesh = createSurface(
        op.size,
        op.location,
        op.startHeight,
        op.colour,
        op.id,
        surfacesById
      );
      meshesByKey.set(`surface:${op.id}`, mesh);
    }

    for (const op of ops) {
      if (op.type !== 'side') continue;
      if (!op.id) continue;
      const mesh = createSides(
        op.fromSurfaceId,
        op.toSurfaceId,
        op.colourScheme,
        surfacesById,
        op.sides,
        op.id
      );
      meshesByKey.set(`side:${op.id}`, mesh);
    }

    // Create a snapshot of the geometry of each mesh
    const snapshot = ops.map((op) => {
      if (!op.id) return { positions: [] };
      const key = `${op.type}:${op.id}`;
      const mesh = meshesByKey.get(key);
      if (!mesh) throw new Error(`Missing mesh for ${key}`);
      return serializeMeshGeometry(mesh, { precision: 5, applyWorldTransform: true });
    });

    expectBaselineJson({
      baselineFile: baselinePathForExample(fileName),
      data: snapshot,
    });
  });
});
