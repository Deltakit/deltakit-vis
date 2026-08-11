import { describe, expect, it } from 'vitest';

import { epsilon } from '@/config/tolerances';

describe('config/tolerances', () => {
  it('exports epsilon', () => {
    expect(epsilon).toBeGreaterThan(0);
    expect(epsilon).toBeCloseTo(0.001);
  });
});
