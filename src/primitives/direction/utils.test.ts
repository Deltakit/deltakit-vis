import * as THREE from 'three';
import { describe, expect, it } from 'vitest';

import { getFromVector } from '@/primitives/direction/utils';

describe('primitives/direction/utils', () => {
  it('getFromVector picks signed axis direction', () => {
    expect(getFromVector(new THREE.Vector3(1, 0, 0)).direction).toBe('X');
    expect(getFromVector(new THREE.Vector3(-1, 0, 0)).direction).toBe('-X');
    expect(getFromVector(new THREE.Vector3(0, 1, 0)).direction).toBe('Y');
    expect(getFromVector(new THREE.Vector3(0, 0, -1)).direction).toBe('-Z');
  });

  it('getFromVector prioritizes x over y over z', () => {
    expect(getFromVector(new THREE.Vector3(1, 1, 1)).direction).toBe('X');
    expect(getFromVector(new THREE.Vector3(0, 1, 1)).direction).toBe('Y');
  });

  it('throws for the zero vector', () => {
    expect(() => getFromVector(new THREE.Vector3(0, 0, 0))).toThrowError(/Invalid direction/i);
  });
});
