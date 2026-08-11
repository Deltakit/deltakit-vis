import * as THREE from 'three';

export type DirectionType = 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z';

const OPPOSITE: Record<DirectionType, DirectionType> = {
  X: '-X',
  '-X': 'X',
  Y: '-Y',
  '-Y': 'Y',
  Z: '-Z',
  '-Z': 'Z',
};

const VECTOR: Record<DirectionType, [number, number, number]> = {
  X: [1, 0, 0],
  '-X': [-1, 0, 0],
  Y: [0, 1, 0],
  '-Y': [0, -1, 0],
  Z: [0, 0, 1],
  '-Z': [0, 0, -1],
};

export class Direction {
  public direction: DirectionType;

  constructor(direction: DirectionType) {
    this.direction = direction;
  }
  // Not used currently, but could be useful in the future
  public getOpposite(): Direction {
    return new Direction(OPPOSITE[this.direction]);
  }

  get vector(): THREE.Vector3 {
    const vec = VECTOR[this.direction];
    return new THREE.Vector3(vec[0], vec[1], vec[2]);
  }
}
