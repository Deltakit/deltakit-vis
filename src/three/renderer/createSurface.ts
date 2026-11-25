import * as THREE from 'three';

import { createSurfaceMesh } from '@/three/meshes/createSurfaceMesh';
import { surfaceDefaultThickness } from '@/config/constants';
import type { SurfaceInfo, ColorProfile } from '@/types/three';

export function createSurface(
  size: number[],
  location: number[],
  startHeight: number,
  colour?: string,
  id?: string | number,
  surfacesById?: Map<string | number, SurfaceInfo>,
  colorProfile: ColorProfile = 'standard',
  customThickness?: number
): THREE.Mesh {
  const thickness = customThickness !== undefined ? customThickness : surfaceDefaultThickness;
  const dimensions = [size[0], size[1], thickness];
  const coordinates = [location[0], location[1], startHeight];

  const mesh = createSurfaceMesh({ dimensions, coordinates, colour, colorProfile });
  mesh.userData.meshType = 'surface';
  if (id !== undefined && surfacesById) {
    mesh.userData.id = id;
    surfacesById.set(id, { dimensions, coordinates, colour });
  }
  return mesh;
}
