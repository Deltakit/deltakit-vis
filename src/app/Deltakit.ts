import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { RenderData } from '@/types/renderData';
import type { PatchRenderData } from '@/patch/types';
import type { VisualisationData } from '@/types/visualisationData';
import { isLogicalPatchData } from '@/types/visualisationData';
import type { ColorProfile } from '@/types/three';
import { VisualisationWrapper } from '@/react/VisualisationWrapper';
import { fetchSpaceTimeData } from '@/lib/utils';

export interface DeltakitOptions {
  colorProfile?: ColorProfile;
  showCoordinate?: boolean;
  showGrid?: boolean;
  cameraType?: 'perspective' | 'isometric';
  showSettingsPanel?: boolean;
  /** Show the surface-code tool and its slice panel over the spacetime view. Off by default. */
  showSurfaceCodePanel?: boolean;
}

/** Warn (once per call) when a multi-round patch payload only shows its first round. */
function warnExtraRounds(rounds: PatchRenderData[]): void {
  if (rounds.length > 1) {
    console.info(
      `deltakit-visualise: showing round ${rounds[0]?.round}; ${rounds.length - 1} further round(s) not rendered.`,
    );
  }
}

export default class Deltakit {
  private root: Root;
  private spacetimeData: RenderData | null = null;
  private patchRounds: PatchRenderData[] | null = null;
  private options: DeltakitOptions = {};

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found.`);
    }
    this.root = createRoot(container);
  }

  /**
   * Render a payload, dispatching on its top-level `type`:
   * `logical_patch` renders the 2D patch, anything else the 3D spacetime view.
   */
  public render(data: VisualisationData, options?: DeltakitOptions): void {
    if (isLogicalPatchData(data)) {
      this.patchRounds = data.ops;
      this.spacetimeData = null;
      warnExtraRounds(data.ops);
    } else {
      this.spacetimeData = data;
      this.patchRounds = null;
    }
    if (options) this.options = { ...this.options, ...options };
    this.mount();
  }

  public renderDynamic(options?: DeltakitOptions): void {
    fetchSpaceTimeData().then((data) => {
      this.spacetimeData = data;
      this.patchRounds = null;
      this.options = { ...this.options, ...options };
      this.mount();
    }).catch((error) => {
      console.error('Error fetching space-time data:', error);
    });
  }

  public renderPatch(rounds: PatchRenderData[], options?: DeltakitOptions): void {
    this.patchRounds = rounds;
    this.spacetimeData = null;
    warnExtraRounds(rounds);
    if (options) this.options = { ...this.options, ...options };
    this.mount();
  }

  public renderBoth(spacetime: RenderData, rounds: PatchRenderData[], options?: DeltakitOptions): void {
    this.spacetimeData = spacetime;
    this.patchRounds = rounds;
    warnExtraRounds(rounds);
    if (options) this.options = { ...this.options, ...options };
    this.mount();
  }

  public setOptions(options: DeltakitOptions): void {
    this.options = { ...this.options, ...options };
    if (this.spacetimeData || this.patchRounds) this.mount();
  }

  public dispose(): void {
    this.root.unmount();
  }

  private mount(): void {
    this.root.render(
      createElement(VisualisationWrapper, {
        spacetimeData: this.spacetimeData || undefined,
        patchRounds: this.patchRounds || undefined,
        ...this.options,
      })
    );
  }
}
