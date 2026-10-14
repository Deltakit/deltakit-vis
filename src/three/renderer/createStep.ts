import * as THREE from 'three';

import { createSideBorder, createSideMaterials } from '@/three/meshes/createSidesMesh';
import { createTaperedGeometry } from '@/three/meshes/createTaperedGeometry';
import { computeSidesParams } from '@/three/sides/computeSidesParams';
import { createBoxFaceOwner } from '@/three/meshes/boxFaceOwner';
import type { SurfaceInfo, ColorProfile } from '@/types/three';
import type { Sides } from '@/types/renderData';

// Connects two surfaces offset in X/Y with an oblique wall rather than a straight vertical one
export function createStep(
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
      `Unable to create step: missing surfaces for IDs from=${fromSurfaceId} to=${toSurfaceId}`
    );
  }

  const fromZ = from.coordinates[2];
  const toZ = to.coordinates[2];
  const { startHeight, height } = computeSidesParams(fromZ, toZ);

  const geometry = createTaperedGeometry(from, to, height);

  geometry.clearGroups();
  geometry.addGroup(0, 6, 3);
  geometry.addGroup(6, 6, 0);
  geometry.addGroup(12, 6, 2);
  geometry.addGroup(18, 6, 1);

  const mesh = new THREE.Mesh(geometry, createSideMaterials(colourScheme, sides, colorProfile));
  mesh.position.z = startHeight;
  mesh.userData.owner = createBoxFaceOwner(mesh);
  mesh.add(createSideBorder(geometry, colorProfile));

  mesh.userData.meshType = 'step';
  if (id !== undefined) {
    mesh.userData.id = id;
  }
  return mesh;
}
