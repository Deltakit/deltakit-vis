import * as THREE from 'three';

import { colourToHex } from '@/config/colours';
import { computeSidesParams } from '@/three/sides/computeSidesParams';
import type { CorrelationOp, SideOp } from '@/types/renderData';
import type { ColorProfile, SurfaceInfo } from '@/types/three';

export function createCorrelation(
  op: CorrelationOp,
  surfacesById: Map<string | number, SurfaceInfo>,
  sidesById: Map<string, SideOp>,
  colorProfile: ColorProfile = 'standard'
): THREE.Mesh[] {
  const block = sidesById.get(op.blockId);
  if (!block) {
    throw new Error(`Unable to create correlation: missing side for blockId=${op.blockId}`);
  }
  const { fromSurfaceId, toSurfaceId } = block;
  const from = surfacesById.get(fromSurfaceId);
  const to = surfacesById.get(toSurfaceId);
  if (!from || !to) {
    throw new Error(
      `Unable to create correlation: missing surfaces for IDs from=${fromSurfaceId} to=${toSurfaceId}`
    );
  }

  if (!Array.isArray(op.surfaces) || !op.surfaces.length) {
    throw new Error('Unable to create correlation: surfaces must be a non-empty array');
  }
  const colourHex = colourToHex(op.colour, colorProfile);
  const positions: number[] = [];
  const indices: number[] = [];
  const { startHeight, height } = computeSidesParams(from.coordinates[2], to.coordinates[2]);
  const isTapered = from.dimensions[0] !== to.dimensions[0] || from.dimensions[1] !== to.dimensions[1];
  const bottom = from.coordinates[2] <= to.coordinates[2] ? from : to;
  const top = bottom === from ? to : from;
  const axisIndices: Record<string, number> = { X: 0, Y: 1, Z: 2 };
  const seen = new Set<string>();

  for (const surface of op.surfaces) {
    const match = typeof surface === 'string' && /^\s*([XYZ])\s*([+-])\s*([XYZ])\s*$/.exec(surface);
    if (!match || match[1] === match[3]) {
      throw new Error(`Unable to create correlation: invalid surface '${surface}'; expected two distinct axes, e.g. 'X+Y'`);
    }
    const [, fullAxis, sign, halfAxis] = match;
    const key = `${fullAxis}${sign}${halfAxis}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const vertexOffset = positions.length / 3;
    for (const [full, half] of [[0, 0.5], [0, sign === '+' ? 1 : 0], [1, sign === '+' ? 1 : 0], [1, 0.5]]) {
      const point = [0.5, 0.5, 0.5];
      point[axisIndices[fullAxis]] = full;
      point[axisIndices[halfAxis]] = half;
      const zFraction = point[2];
      // Match the side renderer's interpolated taper or bounding-box union.
      for (let axis = 0; axis < 2; axis++) {
        const min = isTapered
          ? THREE.MathUtils.lerp(bottom.coordinates[axis], top.coordinates[axis], zFraction)
          : Math.min(from.coordinates[axis], to.coordinates[axis]);
        const size = isTapered
          ? THREE.MathUtils.lerp(bottom.dimensions[axis], top.dimensions[axis], zFraction)
          : Math.max(from.coordinates[axis] + from.dimensions[axis], to.coordinates[axis] + to.dimensions[axis]) - min;
        point[axis] = min + point[axis] * size;
      }
      point[2] = startHeight + zFraction * height;
      positions.push(...point);
    }
    indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: colourHex,
      opacity: 0.7,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  mesh.userData.meshType = 'correlation';
  mesh.userData.blockId = op.blockId;
  return [mesh];
}
