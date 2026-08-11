import type { RenderData } from '@/types/renderData';

/**
 * Op kinds whose height span is a run of stabiliser-measurement rounds.
 *
 * Compared against the part of `op_name` after the dialect prefix, so
 * `log_asm.meas_stab` matches on `meas_stab`.
 */
const ROUND_SPANNING_OPS = new Set(['meas_stab']);

/**
 * One stabiliser-measurement round, as a horizontal slice of the diagram.
 *
 * Rounds exist only inside round-spanning ops. The compiler's `insert-height`
 * pass advances the height counter by one unit per round (`min_rounds` for a
 * stabiliser measurement), so such an op joining a surface at height 0 to one
 * at height 3 spans 3 rounds. Everything else — patch declarations, prepares,
 * measures — costs no height and holds no rounds.
 */
export interface Slice {
  id: string;
  /** Round number, as expected by `/api/get-patches-info-at-round/{round}`. */
  round: number;
  /** Z of the slice plane: the midpoint of the round's slab in the diagram. */
  z: number;
  label: string;
}

/** Strip the dialect prefix: `log_asm.meas_stab` -> `meas_stab`. */
function opKind(opName: string | undefined): string {
  return opName?.split('.').pop() ?? '';
}

/**
 * Expand every round-spanning op in the payload into one slice per round.
 *
 * These ops are *side* items — the vertical connections between two surfaces —
 * so the span comes from the heights of the surfaces they join, not from the
 * side itself. An op based at `startHeight` and covering `n` units contributes
 * rounds `startHeight + 1` through `startHeight + n`.
 *
 * Parallel branches can put two ops over the same heights, so rounds are
 * deduplicated: a round is one round however many patches are live in it.
 */
export function deriveSlices(data: RenderData | undefined): Slice[] {
  if (!data?.ops) return [];

  const heightById = new Map<string | number, number>();
  for (const op of data.ops) {
    if (op.type === 'surface' && op.id !== undefined) heightById.set(op.id, op.startHeight);
  }

  const byRound = new Map<number, Slice>();

  for (const op of data.ops) {
    if (op.type !== 'side' || !ROUND_SPANNING_OPS.has(opKind(op.op_name))) continue;

    const from = heightById.get(op.fromSurfaceId);
    const to = heightById.get(op.toSurfaceId);
    if (from === undefined || to === undefined) continue;

    const startHeight = Math.min(from, to);
    const rounds = Math.round(Math.abs(to - from));

    for (let currentRound = 1; currentRound <= rounds; currentRound++) {
      const round = Math.round(startHeight + currentRound);
      if (byRound.has(round)) continue;

      byRound.set(round, {
        id: `round-${round}`,
        round,
        // Sit inside the round's slab rather than on a boundary shared with the
        // next round, so which round a plane belongs to is unambiguous.
        z: startHeight + currentRound - 0.5,
        label: `Round ${round}`,
      });
    }
  }

  return [...byRound.values()].sort((a, b) => a.round - b.round);
}
