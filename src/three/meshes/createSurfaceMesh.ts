import * as THREE from 'three';

import { colourToHex, getBorderColour } from '@/config/colours';
import { createBoxFaceOwner } from '@/three/meshes/boxFaceOwner';
import type { ColorProfile } from '@/types/three';

export function createSurfaceMesh(params: {
  dimensions: number[]; // [width, depth, height]
  coordinates: number[]; // [x, y, z]
  colour?: string;
  colorProfile?: ColorProfile;
}): THREE.Mesh {
  const { dimensions, coordinates, colour, colorProfile = 'standard' } = params;

  const [width, depth, height] = dimensions;
  const [x, y, z] = coordinates;

  if (colour && colour === 'NONE') return new THREE.Mesh();

  const surfaceColour = colourToHex(colour, colorProfile);
  const borderColour = getBorderColour(colorProfile);

  // Create materials for each face of the box in the order of axis directions: +X, -X, +Y, -Y, +Z, -Z
  const materials = [
    new THREE.MeshBasicMaterial({ color: surfaceColour, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: surfaceColour, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: surfaceColour, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: surfaceColour, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: surfaceColour, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: surfaceColour, side: THREE.DoubleSide }),
  ];

  // We use world Z as the height axis (SceneManager sets camera.up = +Z).
  // THREE.BoxGeometry is (width=X, height=Y, depth=Z), so we pass height as depth.
  const geometry = new THREE.BoxGeometry(width, depth, height);
  
  // Create a thin box geometry to represent the surface
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
