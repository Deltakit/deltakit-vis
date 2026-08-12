import { describe, expect, it } from 'vitest';

import { COLOURS, DEFAULT_COLOUR, colourToHex, normalizeColourName } from '@/config/colours';

describe('config/colours', () => {
  it('normalizes known colours', () => {
    expect(normalizeColourName('red')).toBe('RED');
    expect(normalizeColourName('BLUE')).toBe('BLUE');
  });

  it('returns undefined for unknown/empty colours', () => {
    expect(normalizeColourName(undefined)).toBeUndefined();
    expect(normalizeColourName('')).toBeUndefined();
    expect(normalizeColourName('purple')).toBeUndefined();
  });

  it('maps colour names to hex with a default fallback', () => {
    expect(colourToHex('RED')).toBe(COLOURS.RED);
    expect(colourToHex('blue')).toBe(COLOURS.BLUE);
    expect(colourToHex('not-a-colour')).toBe(DEFAULT_COLOUR);
    expect(colourToHex(undefined)).toBe(DEFAULT_COLOUR);
  });
});
