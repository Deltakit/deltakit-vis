import * as THREE from 'three';

import { DEFAULT_COLOUR, colourToHex, getBorderColour } from '@/config/colours';
import { createBoxFaceOwner } from '@/three/meshes/boxFaceOwner';
import type { Sides } from '@/types/renderData';
import type { ColorProfile } from '@/types/three';

export function createSidesMesh(params: {
  dimensions: number[]; // [width, depth, height]
  coordinates: number[]; // [x, y, z]
  colourScheme: string[]; // [colourForX, colourForY]
  sides?: Sides;
  colorProfile?: ColorProfile;
}): THREE.Mesh {
  const { dimensions, coordinates, colourScheme, sides, colorProfile = 'standard' } = params;

  const [width, depth, height] = dimensions;
  const [x, y, z] = coordinates;

  const colourX = colourToHex(colourScheme[0], colorProfile);
  const colourY = colourToHex(colourScheme[1], colorProfile);
  const borderColour = getBorderColour(colorProfile);

  const showX = sides ? sides['+X'] : true;
  const showNegX = sides ? sides['-X'] : true;
  const showY = sides ? sides['+Y'] : true;
  const showNegY = sides ? sides['-Y'] : true;

  // Create materials for each face of the box in the order of axis directions: +X, -X, +Y, -Y, +Z, -Z
  const materials = [
    new THREE.MeshBasicMaterial({ color: colourX, visible: showX, side: THREE.DoubleSide }), // +X
    new THREE.MeshBasicMaterial({ color: colourX, visible: showNegX, side: THREE.DoubleSide }), // -X
    new THREE.MeshBasicMaterial({ color: colourY, visible: showY, side: THREE.DoubleSide }), // +Y
    new THREE.MeshBasicMaterial({ color: colourY, visible: showNegY, side: THREE.DoubleSide }), // -Y
    new THREE.MeshBasicMaterial({ color: DEFAULT_COLOUR, side: THREE.DoubleSide }), // +Z (removed)
    new THREE.MeshBasicMaterial({ color: DEFAULT_COLOUR, side: THREE.DoubleSide }), // -Z (removed)
  ];

  // We use world Z as the height axis, so we remove the +Z/-Z faces.
  // THREE.BoxGeometry is (width=X, height=Y, depth=Z), so we pass height as depth.
  const geometry = new THREE.BoxGeometry(width, depth, height);
  geometry.groups = geometry.groups.filter((g) => g.materialIndex !== 4 && g.materialIndex !== 5);

  const mesh = new THREE.Mesh(geometry, materials);
  mesh.position.set(x + width / 2, y + depth / 2, z + height / 2);
  mesh.userData.owner = createBoxFaceOwner(mesh);
  
  // Add edges to the surface for better visibility
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: borderColour, linewidth: 2 });
  const border = new THREE.LineSegments(edges, lineMaterial);
  mesh.add(border);

  return mesh;
}
