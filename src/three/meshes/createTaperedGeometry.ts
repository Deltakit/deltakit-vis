import * as THREE from 'three';
import type { SurfaceInfo } from '@/types/three';

// Create a tapered geometry connecting two surfaces with potentially different dimensions
export function createTaperedGeometry(
  fromSurface: SurfaceInfo,
  toSurface: SurfaceInfo,
  height: number
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  const [fromX, fromY] = fromSurface.coordinates;
  const [fromW, fromD] = fromSurface.dimensions;
  const [toX, toY] = toSurface.coordinates;
  const [toW, toD] = toSurface.dimensions;

  const vertices = [
    // From surface corners (z = 0)
    fromX, fromY, 0,                    // 0: front-left
    fromX + fromW, fromY, 0,            // 1: front-right
    fromX + fromW, fromY + fromD, 0,    // 2: back-right
    fromX, fromY + fromD, 0,            // 3: back-left

    // To surface corners (z = height)
    toX, toY, height,                   // 4: front-left
    toX + toW, toY, height,             // 5: front-right
    toX + toW, toY + toD, height,       // 6: back-right
    toX, toY + toD, height,             // 7: back-left
  ];

  // Create faces connecting the two surfaces
  const indices = [
    //   4-------5
    //  /|      /|
    // 7-+-----6 |
    // | 0----+-1
    // |/     | /
    // 3-----2

    // Front face
    0, 1, 5,
    0, 5, 4,

    // Right face
    1, 2, 6,
    1, 6, 5,

    // Back face
    2, 3, 7,
    2, 7, 6,

    // Left face
    3, 0, 4,
    3, 4, 7,

    // Top face
    4, 5, 6,
    4, 6, 7,

    // Bottom face
    0, 3, 2,
    0, 2, 1,
  ];

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
  geometry.computeVertexNormals();

  return geometry;
}
