import * as THREE from 'three';

import { Direction, type DirectionType } from '@/primitives/direction/Direction';

export function getFromVector(vec: THREE.Vector3): Direction {
  const axisOrder: Array<['x' | 'y' | 'z', DirectionType, DirectionType]> = [
    ['x', 'X', '-X'],
    ['y', 'Y', '-Y'],
    ['z', 'Z', '-Z'],
  ];

  for (const [axis, positive, negative] of axisOrder) {
    const value = vec[axis];
    if (value > 0) return new Direction(positive);
    if (value < 0) return new Direction(negative);
  }

  throw new Error('Invalid direction');
}
