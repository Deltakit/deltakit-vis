// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import Deltakit from '@/app/Deltakit';
import type { RenderData } from '@/types/renderData';
import type { PatchRenderData } from '@/patch/types';
import type { LogicalPatchData } from '@/types/visualisationData';

// Mock @react-three/fiber Canvas so jsdom doesn't need WebGL
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children?: unknown }) => children,
  useThree: () => ({ scene: {}, camera: { up: { set: vi.fn() }, position: {} }, size: { width: 800, height: 600 }, gl: { domElement: { style: {} } } }),
  useFrame: vi.fn(),
}));

// Mock @react-three/drei (GizmoHelper, OrbitControls, cameras) to avoid WebGL
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  GizmoHelper: () => null,
  GizmoViewport: () => null,
  PerspectiveCamera: () => null,
  OrthographicCamera: () => null,
}));

describe('app/Deltakit', () => {
  let container: HTMLDivElement;

  /**
   * Roots created during a test. React schedules its render work on a macrotask,
   * so anything left mounted would still be flushing after jsdom is torn down
   * (`ReferenceError: window is not defined`). Unmount and drain before teardown.
   */
  const mounted: Array<{ dispose: () => void }> = [];

  /** Build a Deltakit bound to the test container and register it for cleanup. */
  async function makeDeltakit(containerId = 'app') {
    const deltakit = new Deltakit(containerId);
    mounted.push(deltakit);
    return deltakit;
  }

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
  });

  afterEach(async () => {
    while (mounted.length) mounted.pop()!.dispose();
    // Let React's scheduler drain the work it queued before jsdom goes away.
    await new Promise((resolve) => setTimeout(resolve, 0));
    document.body.removeChild(container);
  });

  it('mounts into the container on render()', async () => {
    const data: RenderData = {
      ops: [
        { type: 'surface', id: 1, size: [3, 3], location: [0, 0], startHeight: 0, colour: 'RED' },
        { type: 'surface', id: 2, size: [3, 3], location: [0, 0], startHeight: 3, colour: 'RED' },
        { id: 3, type: 'side', fromSurfaceId: 1, toSurfaceId: 2, colourScheme: ['BLUE', 'RED'] },
      ],
    };

    const deltakit = await makeDeltakit();
    expect(() => deltakit.render(data)).not.toThrow();
  });

  it("render() dispatches a 'spacetime' payload without throwing", async () => {
    const data: RenderData = {
      type: 'spacetime',
      ops: [{ type: 'surface', id: 1, size: [2, 2], location: [0, 0], startHeight: 0, colour: 'BLUE' }],
    };

    const deltakit = await makeDeltakit();
    expect(() => deltakit.render(data)).not.toThrow();
  });

  it("render() dispatches a 'logical_patch' payload to the patch view", async () => {
    const data: LogicalPatchData = {
      type: 'logical_patch',
      ops: [
        {
          round: 1,
          qubits: [
            { id: 'q0', coordinates: [0, 0] },
            { id: 'q1', coordinates: [1, 0] },
            { id: 'q2', coordinates: [0.5, 1] },
          ],
          patches: [
            {
              plaquettes: [
                { id: 0, weight: 2, shape: 'semicircle', colour: 'blue', coordinates: ['q0', 'q1', 'q2'] },
              ],
            },
          ],
        },
      ],
    };

    const deltakit = await makeDeltakit();
    expect(() => deltakit.render(data)).not.toThrow();
  });

  it('render() only shows the first round of a multi-round logical_patch payload', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    const data: LogicalPatchData = {
      type: 'logical_patch',
      ops: [
        { round: 1, qubits: [{ id: 'q0', coordinates: [0, 0] }], patches: [{ plaquettes: [] }] },
        { round: 2, qubits: [{ id: 'q0', coordinates: [0, 0] }], patches: [{ plaquettes: [] }] },
      ],
    };

    const deltakit = await makeDeltakit();
    expect(() => deltakit.render(data)).not.toThrow();
    expect(info).toHaveBeenCalledWith(expect.stringContaining('round 1'));
    info.mockRestore();
  });

  it('throws when container id is not found', async () => {
    expect(() => new Deltakit('nonexistent')).toThrow("Container with id 'nonexistent' not found.");
  });

  it('setOptions updates options without throwing', async () => {
    const data: RenderData = { ops: [{ type: 'surface', id: 1, size: [2, 2], location: [0, 0], startHeight: 0, colour: 'BLUE' }] };

    const deltakit = await makeDeltakit();
    deltakit.render(data);
    expect(() => deltakit.setOptions({ colorProfile: 'accessible', showGrid: true })).not.toThrow();
  });

  it('dispose() does not throw', async () => {
    const deltakit = await makeDeltakit();
    expect(() => deltakit.dispose()).not.toThrow();
  });

  it('renderPatch() mounts a patch diagram without throwing', async () => {
    const patchData: PatchRenderData = {
      round: 0,
      qubits: [
        { id: 'q0', coordinates: [0, 0] },
        { id: 'q1', coordinates: [1, 0] },
        { id: 'q2', coordinates: [0, 1] },
        { id: 'q3', coordinates: [1, 1] },
      ],
      patches: [
        {
          plaquettes: [
            { id: 1, weight: 4, shape: 'square', colour: 'red', coordinates: ['q0', 'q1', 'q2', 'q3'] },
          ],
        },
      ],
    };

    const deltakit = await makeDeltakit();
    expect(() => deltakit.renderPatch([patchData])).not.toThrow();
  });

  it('renderPatch() accepts boundary (semicircle) plaquettes', async () => {
    const patchData: PatchRenderData = {
      round: 1,
      qubits: [
        { id: 'q0', coordinates: [0, 0] },
        { id: 'q1', coordinates: [1, 0] },
        { id: 'q2', coordinates: [0.5, 1] },
      ],
      patches: [
        {
          plaquettes: [
            { id: 2, weight: 2, shape: 'semicircle', colour: 'blue', coordinates: ['q0', 'q1', 'q2'] },
          ],
        },
      ],
    };

    const deltakit = await makeDeltakit();
    expect(() => deltakit.renderPatch([patchData])).not.toThrow();
  });

  it('renderBoth() mounts spacetime and patch data without throwing', async () => {
    const spacetimeData: RenderData = {
      ops: [
        { type: 'surface', id: 1, size: [3, 3], location: [0, 0], startHeight: 0, colour: 'RED' },
      ],
    };

    const patchData: PatchRenderData = {
      round: 0,
      qubits: [
        { id: 'q0', coordinates: [0, 0] },
        { id: 'q1', coordinates: [1, 0] },
        { id: 'q2', coordinates: [0, 1] },
        { id: 'q3', coordinates: [1, 1] },
      ],
      patches: [
        {
          plaquettes: [
            { id: 1, weight: 4, shape: 'square', colour: 'red', coordinates: ['q0', 'q1', 'q2', 'q3'] },
          ],
        },
      ],
    };

    const deltakit = await makeDeltakit();
    expect(() => deltakit.renderBoth(spacetimeData, [patchData])).not.toThrow();
  });

  it('setOptions() re-mounts when only patchData is set', async () => {
    const patchData: PatchRenderData = {
      round: 0,
      qubits: [{ id: 'q0', coordinates: [0, 0] }],
      patches: [{ plaquettes: [] }],
    };

    const deltakit = await makeDeltakit();
    deltakit.renderPatch([patchData]);
    expect(() => deltakit.setOptions({ colorProfile: 'accessible' })).not.toThrow();
  });

  it('setOptions() is a no-op (no throw) when no data has been rendered yet', async () => {
    const deltakit = await makeDeltakit();
    expect(() => deltakit.setOptions({ showGrid: true })).not.toThrow();
  });

  it('renderPatch() forwards options passed as the second argument', async () => {
    const patchData: PatchRenderData = {
      round: 0,
      qubits: [{ id: 'q0', coordinates: [0, 0] }],
      patches: [{ plaquettes: [] }],
    };

    const deltakit = await makeDeltakit();
    expect(() => deltakit.renderPatch([patchData], { colorProfile: 'bw' })).not.toThrow();
  });
});
