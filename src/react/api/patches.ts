import type { PatchRenderData } from '@/patch/types';
import type { LogicalPatchData } from '@/types/visualisationData';
import { logicalPatchUrl } from '@/lib/utils';

function isPatchRenderData(op: unknown): op is PatchRenderData {
  return !!op && typeof op === 'object' && Array.isArray((op as PatchRenderData).qubits);
}

/**
 * Pull the round's patch out of the response body.
 *
 * The endpoint answers with a `logical_patch` envelope holding the matching
 * rounds — `{"type": "logical_patch", "ops": [...]}` — and an empty `ops` for a
 * round outside the program, rather than a 404.
 */
function unwrapPatch(body: unknown): PatchRenderData | null {
  const ops = (body as LogicalPatchData | null)?.ops;
  return Array.isArray(ops) ? ops.find(isPatchRenderData) ?? null : null;
}

/**
 * Fetch the patch data for a round.
 *
 * The URL comes from `logicalPatchUrl`, so this shares the one base-URL setting
 * (`VITE_API_BASE_URL`) with the rest of the library.
 *
 * Resolves to `null` when the program has no such round.
 */
export async function fetchPatchesAtRound(
  round: number,
  signal?: AbortSignal,
): Promise<PatchRenderData | null> {
  const url = logicalPatchUrl(round);
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} — ${url}`);
  }
  return unwrapPatch(await response.json());
}
