import * as THREE from 'three';

import { computeSidesParams } from '@/three/sides/computeSidesParams';
import { createSidesMesh } from '@/three/meshes/createSidesMesh';
import type { Sides } from '@/types/renderData';
import type { SurfaceInfo, ColorProfile } from '@/types/three';

// Create a sides mesh based on the provided parameters and return it
export function createSides(
  fromSurfaceId: string | number,
  toSurfaceId: string | number,
  colourScheme: string[],
  surfacesById: Map<string | number, SurfaceInfo>,
  sides?: Sides,
  id?: string | number,
  colorProfile: ColorProfile = 'standard'
): THREE.Mesh {
  const from = surfacesById.get(fromSurfaceId);
  const to = surfacesById.get(toSurfaceId);
  if (!from || !to) {
    throw new Error(
      `Unable to create sides: missing surfaces for IDs from=${fromSurfaceId} to=${toSurfaceId}`
    );
  }

  const fromZ = from.coordinates[2];
  const toZ = to.coordinates[2];
  const { startHeight, height } = computeSidesParams(fromZ, toZ);

  // Bounding-box union so sides correctly span non-aligned or differently-sized surfaces
  const xMin = Math.min(from.coordinates[0], to.coordinates[0]);
  const yMin = Math.min(from.coordinates[1], to.coordinates[1]);
  const xMax = Math.max(from.coordinates[0] + from.dimensions[0], to.coordinates[0] + to.dimensions[0]);
  const yMax = Math.max(from.coordinates[1] + from.dimensions[1], to.coordinates[1] + to.dimensions[1]);

  const dimensions = [xMax - xMin, yMax - yMin, height];
  const coordinates = [xMin, yMin, startHeight];

  const mesh = createSidesMesh({ dimensions, coordinates, colourScheme, sides, colorProfile });
  mesh.userData.meshType = 'side';
  if (id !== undefined) {
    mesh.userData.id = id;
  }
  return mesh;
}
