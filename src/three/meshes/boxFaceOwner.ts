import type * as THREE from 'three';

import { Direction, type DirectionType } from '@/primitives/Direction';

const directionToMaterialIndex: Record<DirectionType, number> = {
  X: 0,
  '-X': 1,
  Y: 2,
  '-Y': 3,
  Z: 4,
  '-Z': 5,
};

export interface BoxFaceOwner {
  removeSurface(direction: Direction): void;
}

export function createBoxFaceOwner(mesh: THREE.Mesh): BoxFaceOwner {
  const removed = new Set<DirectionType>();

  return {
    removeSurface(direction: Direction) {
      const dir = direction.direction;
      if (removed.has(dir)) return;
      removed.add(dir);

      const geometry = mesh.geometry;
      const materialIndexToRemove = directionToMaterialIndex[dir];

      if (!geometry?.groups) return;
      geometry.groups = geometry.groups.filter((g) => g.materialIndex !== materialIndexToRemove);
    },
  };
}
