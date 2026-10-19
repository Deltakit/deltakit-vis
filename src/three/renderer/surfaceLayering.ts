import type { SurfaceOp } from '@/types/renderData';

export const surfaceLayerSpacing = 0.01;
const surfaceLayerSpacingTolerance = 1e-9;

type PlacedSurface = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  z: number;
};

function footprintsOverlap(a: PlacedSurface, b: PlacedSurface): boolean {
  return a.xMin < b.xMax && a.xMax > b.xMin && a.yMin < b.yMax && a.yMax > b.yMin;
}

function surfaceBounds(op: SurfaceOp, startHeight: number): PlacedSurface {
  return {
    xMin: op.location[0],
    xMax: op.location[0] + op.size[0],
    yMin: op.location[1],
    yMax: op.location[1] + op.size[1],
    z: startHeight,
  };
}

export function createSurfaceLayerResolver(): (op: SurfaceOp) => number {
  const placedSurfaces: PlacedSurface[] = [];

  return (op: SurfaceOp): number => {
    let startHeight = op.startHeight;
    let candidate = surfaceBounds(op, startHeight);

    let moved = true;
    while (moved) {
      moved = false;
      for (const placed of placedSurfaces) {
        if (footprintsOverlap(candidate, placed) && Math.abs(candidate.z - placed.z) < surfaceLayerSpacing - surfaceLayerSpacingTolerance) {
          startHeight = placed.z + surfaceLayerSpacing;
          candidate = surfaceBounds(op, startHeight);
          moved = true;
          break;
        }
      }
    }

    placedSurfaces.push(candidate);
    return startHeight;
  };
}
