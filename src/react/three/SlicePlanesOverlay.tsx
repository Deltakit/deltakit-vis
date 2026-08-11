import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

import type { RenderData } from '@/types/renderData';
import type { Slice } from '@/react/slices';

const PLANE_COLOUR = '#a0c4ff';
const BORDER_COLOUR = '#000000';

/** Fill opacity by plane state. `dimmed` applies to planes other than the selected one. */
const FILL_OPACITY = { selected: 0.85, hovered: 0.6, resting: 0.2, dimmed: 0.15 };

/** How far the planes overhang the diagram's footprint, in world units. */
const PLANE_PADDING = 0.3;

/**
 * Lift above the surface at the same height so the two are not coplanar.
 * Surfaces are `surfaceDefaultThickness` (0.001) thick, so this clears the top
 * face while staying invisible at the scale of a patch (~3 units wide).
 */
const Z_OFFSET = 0.01;

export interface SceneBounds {
  centerX: number;
  centerY: number;
  width: number;
  depth: number;
}

/**
 * The XY footprint of the diagram's surfaces.
 *
 * `location` is a surface's minimum corner and `size` its extent, matching
 * `createSurfaceMesh`, which positions each box at `location + size / 2`.
 */
export function computeSceneBounds(data: RenderData): SceneBounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const op of data.ops ?? []) {
    if (op.type !== 'surface') continue;
    minX = Math.min(minX, op.location[0]);
    maxX = Math.max(maxX, op.location[0] + op.size[0]);
    minY = Math.min(minY, op.location[1]);
    maxY = Math.max(maxY, op.location[1] + op.size[1]);
  }

  // No surfaces — fall back to a unit footprint rather than NaN geometry.
  if (!Number.isFinite(minX)) return { centerX: 0.5, centerY: 0.5, width: 1, depth: 1 };

  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: maxX - minX,
    depth: maxY - minY,
  };
}

interface SlicePlaneMeshProps {
  slice: Slice;
  bounds: SceneBounds;
  isHovered: boolean;
  isSelected: boolean;
  hasSelection: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

function SlicePlaneMesh({
  slice,
  bounds,
  isHovered,
  isSelected,
  hasSelection,
  onHover,
  onSelect,
}: SlicePlaneMeshProps) {
  const width = bounds.width + PLANE_PADDING * 2;
  const depth = bounds.depth + PLANE_PADDING * 2;

  // Priority: selected > hovered > default. Once something is selected the rest
  // recede so the chosen slice reads clearly.
  const fillOpacity = isSelected
    ? FILL_OPACITY.selected
    : isHovered
      ? FILL_OPACITY.hovered
      : hasSelection
        ? FILL_OPACITY.dimmed
        : FILL_OPACITY.resting;
  const borderOpacity = isSelected || isHovered ? 1 : 0;

  const edges = useMemo(() => {
    const plane = new THREE.PlaneGeometry(width, depth);
    const edgesGeometry = new THREE.EdgesGeometry(plane);
    plane.dispose();
    return edgesGeometry;
  }, [width, depth]);

  useEffect(() => () => edges.dispose(), [edges]);

  return (
    <group
      position={[bounds.centerX, bounds.centerY, slice.z + Z_OFFSET]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(slice.id);
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(slice.id);
      }}
    >
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color={PLANE_COLOUR}
          transparent
          opacity={fillOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <lineSegments>
        <primitive object={edges} attach="geometry" />
        <lineBasicMaterial color={BORDER_COLOUR} transparent opacity={borderOpacity} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

export interface SlicePlanesOverlayProps {
  data: RenderData;
  slices: Slice[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onHoverChange?: (id: string | null) => void;
  onSelectId?: (id: string) => void;
}

/**
 * Clickable horizontal planes, one per slice, laid over the spacetime diagram.
 *
 * The planes carry no `userData.owner`, so `fitCameraToScene` — which unions
 * only owner-tagged meshes — ignores them when framing the view.
 */
export function SlicePlanesOverlay({
  data,
  slices,
  selectedId,
  hoveredId,
  onHoverChange,
  onSelectId,
}: SlicePlanesOverlayProps) {
  const bounds = useMemo(() => computeSceneBounds(data), [data]);

  return (
    <group userData={{ noExport: true }}>
      {slices.map((slice) => (
        <SlicePlaneMesh
          key={slice.id}
          slice={slice}
          bounds={bounds}
          isHovered={hoveredId === slice.id}
          isSelected={selectedId === slice.id}
          hasSelection={selectedId != null}
          onHover={(id) => onHoverChange?.(id)}
          onSelect={(id) => onSelectId?.(id)}
        />
      ))}
    </group>
  );
}
