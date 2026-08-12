import { epsilon } from '@/config/tolerances';

export function computeSidesParams(fromHeight: number, toHeight: number): {
  startHeight: number;
  height: number;
} {
  const startHeight = Math.min(fromHeight, toHeight);
  const height = Math.max(Math.abs(toHeight - fromHeight), epsilon);
  return { startHeight, height };
}
