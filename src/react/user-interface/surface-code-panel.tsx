import * as React from 'react';
import { ChevronRight, ChevronLeft, X, Layers, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PatchRenderData } from '@/patch/types';
import { PatchDiagram } from '@/patch/PatchDiagram';
import { fetchPatchesAtRound } from '@/react/api/patches';
import type { Slice } from '@/react/slices';

type FetchState =
  | { status: 'loading' }
  | { status: 'ready'; data: PatchRenderData }
  | { status: 'empty' }
  | { status: 'error'; message: string };

/** Fetch the patch data for a round, cancelling in flight requests on change. */
function useSlicePatch(round: number | null): FetchState | null {
  const [state, setState] = React.useState<FetchState | null>(null);

  React.useEffect(() => {
    if (round === null) {
      setState(null);
      return;
    }

    const controller = new AbortController();
    setState({ status: 'loading' });

    fetchPatchesAtRound(round, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState(data ? { status: 'ready', data } : { status: 'empty' });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
      });

    return () => controller.abort();
  }, [round]);

  return state;
}

/** Detail view — the patch diagram for the selected slice. */
function SliceDetailView({
  slice,
  state,
  onBack,
}: {
  slice: Slice;
  state: FetchState | null;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" />
          Back
        </button>
        <div className="h-3 w-px bg-border" />
        <span className="truncate text-xs font-semibold">{slice.label}</span>
      </div>

      <div className="aspect-square w-full overflow-hidden border-b border-border bg-muted/20">
        {state?.status === 'ready' ? (
          <PatchDiagram data={state.data} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {state?.status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : state?.status === 'error' ? (
              <span className="px-3 text-center font-mono text-[10px] break-all text-red-500">
                {state.message}
              </span>
            ) : (
              <span className="px-3 text-center font-mono text-[11px] text-muted-foreground">
                No patch data at round {slice.round}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** List view — every slice through the spacetime diagram. */
function SliceListView({
  slices,
  hoveredId,
  onHoverChange,
  onSelect,
}: {
  slices: Slice[];
  hoveredId?: string | null;
  onHoverChange?: (id: string | null) => void;
  onSelect: (slice: Slice) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold">Rounds</span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {slices.length} round{slices.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {slices.length === 0 ? (
          <p className="px-3 py-3 text-[10px] italic text-muted-foreground">
            No rounds in this diagram
          </p>
        ) : (
          <div className="flex flex-col">
            {[...slices].reverse().map((slice, idx) => (
              <React.Fragment key={slice.id}>
                {idx > 0 && <div className="mx-3 h-px bg-border" />}
                <button
                  onClick={() => onSelect(slice)}
                  onMouseEnter={() => onHoverChange?.(slice.id)}
                  onMouseLeave={() => onHoverChange?.(null)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    hoveredId === slice.id ? 'bg-accent' : 'hover:bg-accent',
                  )}
                >
                  <div className="flex w-8 shrink-0 flex-col items-center justify-center">
                    <span className="font-mono text-sm font-light leading-none">{slice.round}</span>
                    <span className="text-[8px] uppercase text-muted-foreground">Rnd</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium leading-none">{slice.label}</p>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-3 w-3 shrink-0',
                      hoveredId === slice.id ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  />
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export interface SurfaceCodePanelProps {
  slices: Slice[];
  /** Shared selection id — synced with the slice planes in the 3D scene. */
  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
  /** Shared hover id — synced with the slice planes in the 3D scene. */
  hoveredId?: string | null;
  onHoverChange?: (id: string | null) => void;
  onClose?: () => void;
}

export function SurfaceCodePanel({
  slices,
  selectedId,
  onSelectId,
  hoveredId,
  onHoverChange,
  onClose,
}: SurfaceCodePanelProps) {
  const selectedSlice = selectedId ? slices.find((s) => s.id === selectedId) ?? null : null;
  const state = useSlicePatch(selectedSlice?.round ?? null);

  return (
    <div className="flex h-full w-64 flex-col border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Surface Code
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close panel"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {selectedSlice ? (
          <SliceDetailView
            slice={selectedSlice}
            state={state}
            onBack={() => onSelectId?.(null)}
          />
        ) : (
          <SliceListView
            slices={slices}
            hoveredId={hoveredId}
            onHoverChange={onHoverChange}
            onSelect={(s) => onSelectId?.(s.id)}
          />
        )}
      </div>
    </div>
  );
}
