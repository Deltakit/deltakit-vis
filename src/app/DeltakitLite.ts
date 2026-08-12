import { SceneManager } from '@/three/SceneManager';
import type { SurfaceInfo } from '@/types/three';
import { createSurface } from '@/three/renderer/createSurface';
import { createSides } from '@/three/renderer/createSides';
import type { RenderData } from '@/types/renderData';
import type { PatchRenderData } from '@/patch/types';
import type { VisualisationData } from '@/types/visualisationData';
import { isLogicalPatchData } from '@/types/visualisationData';
import { createPatchRenderer, type PatchRenderer } from '@/patch/lite/renderPatchLite';
import { Direction } from '@/primitives/Direction';

export default class Deltakit {
  private canvas: HTMLCanvasElement;
  private surfacesById: Map<string | number, SurfaceInfo>;
  private sceneManager: SceneManager | null = null;
  private patchRenderer: PatchRenderer | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found.`);
    }

    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'deltakit-canvas';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      container.appendChild(canvas);
    }
    this.canvas = canvas;
    this.surfacesById = new Map();
  }

  /**
   * Render a payload, dispatching on its top-level `type`:
   * `logical_patch` renders the 2D patch, anything else the 3D spacetime view.
   */
  public render(data: VisualisationData): void {
    if (isLogicalPatchData(data)) {
      this.renderPatch(data.ops);
      return;
    }
    this.renderSpacetime(data);
  }

  private renderPatch(rounds: PatchRenderData[]): void {
    if (rounds.length === 0) return;
    if (rounds.length > 1) {
      console.info(
        `deltakit-visualise: showing round ${rounds[0]?.round}; ${rounds.length - 1} further round(s) not rendered.`,
      );
    }
    if (!this.patchRenderer) {
      this.patchRenderer = createPatchRenderer(this.canvas);
    }
    this.patchRenderer.render(rounds[0]);
  }

  private renderSpacetime(data: RenderData): void {
    if (!this.sceneManager) {
      this.sceneManager = new SceneManager(this.canvas);
    }
    this.surfacesById.clear();

    if (data.ops) {
      for (const op of data.ops) {
        if (op.type === 'surface') {
          const patchSurface = createSurface(op.size, op.location, op.startHeight, op.colour, op.id, this.surfacesById);
          this.sceneManager.addToScene(patchSurface);
        }
      }

      for (const op of data.ops) {
        if (op.type === 'side') {
          const patchSide = createSides(op.fromSurfaceId, op.toSurfaceId, op.colourScheme, this.surfacesById, op.sides, op.id);
          this.sceneManager.addToScene(patchSide);
        } else if (op.type !== 'surface') {
          console.warn('Unknown operation type:', op);
        }
      }
    }

    if (data.removeSurfaceFromAxis) {
      this.sceneManager.removeSurfaceFromAll(new Direction(data.removeSurfaceFromAxis));
    }
    this.sceneManager.fitCameraToScene();
  }
}
