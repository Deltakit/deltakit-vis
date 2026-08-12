import { describe, expect, it } from 'vitest';

import { Direction } from '@/primitives/Direction';

describe('Direction', () => {
  it('computes opposite directions', () => {
    expect(new Direction('X').getOpposite().direction).toBe('-X');
    expect(new Direction('-Y').getOpposite().direction).toBe('Y');
    expect(new Direction('Z').getOpposite().direction).toBe('-Z');
  });

  it('maps to vectors', () => {
    const v = new Direction('-Z').vector;
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
    expect(v.z).toBe(-1);
  });
});
