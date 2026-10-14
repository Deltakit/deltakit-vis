import * as THREE from 'three';

import { createSideBorder, createSideMaterials, createSidesMesh } from '@/three/meshes/createSidesMesh';
import { createTaperedGeometry } from '@/three/meshes/createTaperedGeometry';
import { computeSidesParams } from '@/three/sides/computeSidesParams';
import { createBoxFaceOwner } from '@/three/meshes/boxFaceOwner';
import type { SurfaceInfo, ColorProfile } from '@/types/three';
import type { Sides } from '@/types/renderData';

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

  const isTapered = from.dimensions[0] !== to.dimensions[0] || from.dimensions[1] !== to.dimensions[1];

  let mesh: THREE.Mesh;

  if (isTapered) {
    const geometry = createTaperedGeometry(from, to, height);

    geometry.clearGroups();
    geometry.addGroup(0, 6, 3);
    geometry.addGroup(6, 6, 0);
    geometry.addGroup(12, 6, 2);
    geometry.addGroup(18, 6, 1);

    mesh = new THREE.Mesh(geometry, createSideMaterials(colourScheme, sides, colorProfile));
    mesh.position.z = startHeight;
    mesh.userData.owner = createBoxFaceOwner(mesh);
    mesh.add(createSideBorder(geometry, colorProfile));
  } else {
    // Bounding-box union so sides correctly span non-aligned surfaces
    const xMin = Math.min(from.coordinates[0], to.coordinates[0]);
    const yMin = Math.min(from.coordinates[1], to.coordinates[1]);
    const xMax = Math.max(from.coordinates[0] + from.dimensions[0], to.coordinates[0] + to.dimensions[0]);
    const yMax = Math.max(from.coordinates[1] + from.dimensions[1], to.coordinates[1] + to.dimensions[1]);

    mesh = createSidesMesh({
      dimensions: [xMax - xMin, yMax - yMin, height],
      coordinates: [xMin, yMin, startHeight],
      colourScheme,
      sides,
      colorProfile,
    });
  }

  mesh.userData.meshType = 'side';
  if (id !== undefined) {
    mesh.userData.id = id;
  }
  return mesh;
}
