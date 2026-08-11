import type { ColorProfile } from '@/types/three';

export const STANDARD_PALETTE = {
  BLUE: 0x3D3DF0,
  RED: 0xE44545,
  GREEN: 0x32FF32,
  YELLOW: 0xFFFF32,
  GREY: 0xaaaaaa,
} as const;

export const ACCESSIBLE_PALETTE = {
  BLUE: 0x56B4E9,
  RED: 0xE69F00,
  GREEN: 0x009E73,
  YELLOW: 0xF0E442,
  GREY: 0x888888,
} as const;

export const BW_PALETTE = {
  BLUE: 0x000000,
  RED: 0xFFFFFF,
  GREEN: 0x808080,
  YELLOW: 0xD3D3D3,
  GREY: 0x808080,
} as const;

// Backward-compatible alias
export const COLOURS = STANDARD_PALETTE;

export type NamedColour = keyof typeof STANDARD_PALETTE;

export const DEFAULT_COLOUR = 0xcccccc;

export function getPalette(profile: ColorProfile = 'standard') {
  switch (profile) {
    case 'accessible': return ACCESSIBLE_PALETTE;
    case 'bw': return BW_PALETTE;
    default: return STANDARD_PALETTE;
  }
}

export function normalizeColourName(value?: string, profile: ColorProfile = 'standard'): NamedColour | undefined {
  if (!value) return undefined;
  const key = value.toUpperCase() as NamedColour;
  const palette = getPalette(profile);
  return key in palette ? key : undefined;
}

export function colourToHex(value?: string, profile: ColorProfile = 'standard'): number {
  const normalized = normalizeColourName(value, profile);
  const palette = getPalette(profile);
  return normalized ? palette[normalized] : DEFAULT_COLOUR;
}

export function getBorderColour(profile: ColorProfile = 'standard'): number {
  return profile === 'bw' ? 0x7c7c7c : 0xffffff;
}
