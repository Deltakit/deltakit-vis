import type { RenderData } from './renderData';
import type { PatchRenderData } from '@/patch/types';

/**
 * Spacetime (3D logical-assembly) payload.
 *
 * `ops` are surface/side operations. `type` is optional so legacy untyped
 * payloads (which were always spacetime) keep working.
 */
export type SpacetimeData = RenderData;

/**
 * 2D logical-patch (surface-code) payload.
 *
 * `ops` is a list of per-round patch items; one item describes the patch at a
 * single stabiliser-measurement round.
 */
export interface LogicalPatchData {
    type: "logical_patch";
    ops: PatchRenderData[];
}

/** Top-level payload, discriminated by `type`. */
export type VisualisationData = SpacetimeData | LogicalPatchData;

/** Narrow a payload to the logical-patch variant. */
export function isLogicalPatchData(data: VisualisationData): data is LogicalPatchData {
    return "type" in data && data.type === "logical_patch";
}
