import { describe, expect, it } from 'vitest';

import { epsilon } from '@/config/tolerances';
import { computeSidesParams } from '@/three/sides/computeSidesParams';

describe('three/sides/computeSidesParams', () => {
  it('computes startHeight as min and height as absolute difference', () => {
    expect(computeSidesParams(0, 3)).toEqual({ startHeight: 0, height: 3 });
    expect(computeSidesParams(5, 2)).toEqual({ startHeight: 2, height: 3 });
  });

  it('clamps height to epsilon when equal heights', () => {
    expect(computeSidesParams(1, 1)).toEqual({ startHeight: 1, height: epsilon });
  });
});
