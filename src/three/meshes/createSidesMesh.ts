import * as THREE from 'three';

import { colourToHex, getBorderColour } from '@/config/colours';
import { createBoxFaceOwner } from '@/three/meshes/boxFaceOwner';
import type { ColorProfile } from '@/types/three';
import type { Sides } from '@/types/renderData';

export function createSideMaterials(
  colourScheme: string[],
  sides: Sides | undefined,
  colorProfile: ColorProfile
): THREE.MeshBasicMaterial[] {
  const faceColours =
    colourScheme.length >= 4
      ? colourScheme.slice(0, 4)
      : [colourScheme[0], colourScheme[0], colourScheme[1], colourScheme[1]];
  const faces: (keyof Sides)[] = ['+X', '-X', '+Y', '-Y'];
  const isVisible = (side: keyof Sides) => (sides ? sides[side] : true);

  return faces.map(
    (face, i) =>
      new THREE.MeshBasicMaterial({
        color: colourToHex(faceColours[i], colorProfile),
        visible: isVisible(face),
        side: THREE.DoubleSide,
      })
  );
}

export function createSideBorder(
  geometry: THREE.BufferGeometry,
  colorProfile: ColorProfile
): THREE.LineSegments {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: getBorderColour(colorProfile), linewidth: 2 })
  );
}

export function createSidesMesh(params: {
  dimensions: number[]; // [width, depth, height]
  coordinates: number[]; // [x, y, z]
  colourScheme: string[]; // [colourForX, colourForY] or [+X, -X, +Y, -Y]
  sides?: Sides;
  colorProfile?: ColorProfile;
}): THREE.Mesh {
  const { dimensions, coordinates, colourScheme, sides, colorProfile = 'standard' } = params;

  const [width, depth, height] = dimensions;
  const [x, y, z] = coordinates;

  const geometry = new THREE.BoxGeometry(width, depth, height);
  geometry.groups = geometry.groups.filter((g) => g.materialIndex !== 4 && g.materialIndex !== 5);

  const mesh = new THREE.Mesh(
    geometry,
    createSideMaterials(colourScheme, sides, colorProfile)
  );
  mesh.position.set(x + width / 2, y + depth / 2, z + height / 2);
  mesh.userData.owner = createBoxFaceOwner(mesh);
  mesh.add(createSideBorder(geometry, colorProfile));

  return mesh;
}
