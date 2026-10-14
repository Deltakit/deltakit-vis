/**
 * Fills the area a patch gains (or loses) when it is resized between two
 * surfaces, as one polygon per side that grew.
 *
 * The steps, in order:
 *
 * 1. Turn both surfaces into rectangles in the XY plane.
 * 2. If they do not overlap, build a single connector rectangle bridging the
 *    gap and skip to step 5.
 * 3. Otherwise compute their overlap: the part of the patch that did not move.
 * 4. For each side (left, right, bottom, top), work out the trapezoid covering
 *    the growth on that side directly from the coordinates. Its long edge is
 *    the outer rectangle's edge, its short edge is the overlap's matching edge,
 *    and 45-degree diagonals join their ends. A side is skipped when the patch
 *    did not grow there.
 * 5. Extrude each polygon to the surface thickness and colour it: growth along
 *    X gets the contrasting colour, growth along Y and the connector keep the
 *    surface's own colour.
 * 6. Give every mesh a border, so the diagonals stay visible as the line
 *    dividing the two growth directions.
 */
import * as THREE from 'three';

import { colourToHex, getBorderColour } from '@/config/colours';
import type { SurfaceInfo, ColorProfile } from '@/types/three';

type Rect = { xMin: number; xMax: number; yMin: number; yMax: number };
type Point = [number, number];

function toRect(surface: SurfaceInfo): Rect {
  const xMin = surface.coordinates[0];
  const yMin = surface.coordinates[1];
  const xMax = xMin + surface.dimensions[0];
  const yMax = yMin + surface.dimensions[1];
  return { xMin, xMax, yMin, yMax };
}

function hasOverlap(a: Rect, b: Rect): boolean {
  return a.xMin < b.xMax && a.xMax > b.xMin && a.yMin < b.yMax && a.yMax > b.yMin;
}

function spanBetweenOrOverlap(aMin: number, aMax: number, bMin: number, bMax: number): [number, number] {
  if (aMax < bMin) return [aMax, bMin];
  if (bMax < aMin) return [bMax, aMin];
  return [Math.max(aMin, bMin), Math.min(aMax, bMax)];
}

function overlapRect(a: Rect, b: Rect): Rect {
  return {
    xMin: Math.max(a.xMin, b.xMin),
    xMax: Math.min(a.xMax, b.xMax),
    yMin: Math.max(a.yMin, b.yMin),
    yMax: Math.min(a.yMax, b.yMax),
  };
}

function connectorRectForDisjoint(a: Rect, b: Rect): Rect | null {
  const [xMin, xMax] = spanBetweenOrOverlap(a.xMin, a.xMax, b.xMin, b.xMax);
  const [yMin, yMax] = spanBetweenOrOverlap(a.yMin, a.yMax, b.yMin, b.yMax);
  if (xMax <= xMin || yMax <= yMin) return null;
  return { xMin, xMax, yMin, yMax };
}

function pickSurfaceColour(from: SurfaceInfo, to: SurfaceInfo): string {
  if (from.colour && from.colour !== 'NONE') return from.colour;
  if (to.colour && to.colour !== 'NONE') return to.colour;
  return 'BLUE';
}

function pickContrastColour(colour: string): string {
  return colour === 'RED' ? 'BLUE' : 'RED';
}

function rectToPolygon(rect: Rect): Point[] {
  return [
    [rect.xMin, rect.yMin],
    [rect.xMax, rect.yMin],
    [rect.xMax, rect.yMax],
    [rect.xMin, rect.yMax],
  ];
}

function leftTrapezoid(a: Rect, b: Rect, overlap: Rect): Point[] | null {
  const outer = a.xMin <= b.xMin ? a : b;
  if (outer.xMin >= overlap.xMin) return null;
  return [
    [outer.xMin, outer.yMin],
    [overlap.xMin, overlap.yMin],
    [overlap.xMin, overlap.yMax],
    [outer.xMin, outer.yMax],
  ];
}

function rightTrapezoid(a: Rect, b: Rect, overlap: Rect): Point[] | null {
  const outer = a.xMax >= b.xMax ? a : b;
  if (outer.xMax <= overlap.xMax) return null;
  return [
    [overlap.xMax, overlap.yMin],
    [outer.xMax, outer.yMin],
    [outer.xMax, outer.yMax],
    [overlap.xMax, overlap.yMax],
  ];
}

function bottomTrapezoid(a: Rect, b: Rect, overlap: Rect): Point[] | null {
  const outer = a.yMin <= b.yMin ? a : b;
  if (outer.yMin >= overlap.yMin) return null;
  return [
    [outer.xMin, outer.yMin],
    [outer.xMax, outer.yMin],
    [overlap.xMax, overlap.yMin],
    [overlap.xMin, overlap.yMin],
  ];
}

function topTrapezoid(a: Rect, b: Rect, overlap: Rect): Point[] | null {
  const outer = a.yMax >= b.yMax ? a : b;
  if (outer.yMax <= overlap.yMax) return null;
  return [
    [overlap.xMin, overlap.yMax],
    [overlap.xMax, overlap.yMax],
    [outer.xMax, outer.yMax],
    [outer.xMin, outer.yMax],
  ];
}

function createPolygonMesh(
  points: Point[],
  z: number,
  thickness: number,
  colour: string,
  colorProfile: ColorProfile
): THREE.Mesh {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });

  const material = new THREE.MeshBasicMaterial({
    color: colourToHex(colour, colorProfile),
    side: THREE.DoubleSide,
    toneMapped: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, z);

  mesh.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: getBorderColour(colorProfile) })
    )
  );

  mesh.userData.owner = { removeSurface: () => {} };

  return mesh;
}

export function createResizeFill(
  fromSurfaceId: string | number,
  toSurfaceId: string | number,
  surfacesById: Map<string | number, SurfaceInfo>,
  id?: string | number,
  colorProfile: ColorProfile = 'standard'
): THREE.Mesh[] {
  const from = surfacesById.get(fromSurfaceId);
  const to = surfacesById.get(toSurfaceId);
  if (!from || !to) {
    throw new Error(
      `Unable to create resize fill: missing surfaces for IDs from=${fromSurfaceId} to=${toSurfaceId}`
    );
  }

  const surfaceColour = pickSurfaceColour(from, to);
  const contrastColour = pickContrastColour(surfaceColour);

  const fromRect = toRect(from);
  const toRectangle = toRect(to);

  const regions: { colour: string; name: string; points: Point[] }[] = [];

  if (hasOverlap(fromRect, toRectangle)) {
    const overlap = overlapRect(fromRect, toRectangle);
    const sides = [
      { colour: contrastColour, name: 'x-growth', points: leftTrapezoid(fromRect, toRectangle, overlap) },
      { colour: contrastColour, name: 'x-growth', points: rightTrapezoid(fromRect, toRectangle, overlap) },
      { colour: surfaceColour, name: 'y-growth', points: bottomTrapezoid(fromRect, toRectangle, overlap) },
      { colour: surfaceColour, name: 'y-growth', points: topTrapezoid(fromRect, toRectangle, overlap) },
    ];
    for (const side of sides) {
      if (side.points) regions.push({ ...side, points: side.points });
    }
  } else {
    const connector = connectorRectForDisjoint(fromRect, toRectangle);
    if (connector) {
      regions.push({ colour: surfaceColour, name: 'connector', points: rectToPolygon(connector) });
    }
  }

  const z = Math.min(from.coordinates[2], to.coordinates[2]);
  const thickness = from.dimensions[2];

  return regions.map((region, index) => {
    const mesh = createPolygonMesh(region.points, z, thickness, region.colour, colorProfile);
    mesh.userData.meshType = 'resize';
    mesh.userData.resizeRegion = region.name;
    if (id !== undefined) mesh.userData.id = `${String(id)}:${index}`;
    return mesh;
  });
}
