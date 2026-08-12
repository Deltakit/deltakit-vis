import Deltakit from './index.lite';
import type { LogicalPatchData } from '@/types/visualisationData';

const exampleDistance1: LogicalPatchData = {
  type: 'logical_patch',
  ops: [
    {
      round: 2,
      qubits: [
        { id: 'q_0', coordinates: [0.5, 0.5] },
        { id: 'q_1', coordinates: [1.5, 0.5] },
        { id: 'q_2', coordinates: [0.5, 1.5] },
        { id: 'q_3', coordinates: [1.5, 1.5] },
        { id: 'q_4', coordinates: [1.0, 0.0] },
        { id: 'q_5', coordinates: [1.0, 1.0] },
        { id: 'q_6', coordinates: [1.0, 2.0] },
      ],
      patches: [
        {
          plaquettes: [
            { id: 0, weight: 4, shape: 'square', colour: 'red', coordinates: ['q_0', 'q_1', 'q_2', 'q_3'] },
            { id: 1, weight: 2, shape: 'semicircle', colour: 'blue', coordinates: ['q_2', 'q_3', 'q_6'] },
            { id: 2, weight: 2, shape: 'semicircle', colour: 'blue', coordinates: ['q_0', 'q_1', 'q_4'] },
          ],
        },
      ],
    },
  ],
};

const exampleDistance3: LogicalPatchData = {
  type: 'logical_patch',
  ops: [
    {
      round: 3,
      qubits: [
        // Data qubits (3×3 grid)
        { id: 'd0', coordinates: [0, 0] },
        { id: 'd1', coordinates: [2, 0] },
        { id: 'd2', coordinates: [4, 0] },
        { id: 'd3', coordinates: [0, 2] },
        { id: 'd4', coordinates: [2, 2] },
        { id: 'd5', coordinates: [4, 2] },
        { id: 'd6', coordinates: [0, 4] },
        { id: 'd7', coordinates: [2, 4] },
        { id: 'd8', coordinates: [4, 4] },
        // Interior measure qubits (weight-4 centers)
        { id: 'a_int_0', coordinates: [1, 1] },
        { id: 'a_int_1', coordinates: [3, 1] },
        { id: 'a_int_2', coordinates: [1, 3] },
        { id: 'a_int_3', coordinates: [3, 3] },
        // Boundary measure qubits (weight-2 centers)
        { id: 'a_t1', coordinates: [3, -1] },
        { id: 'a_r1', coordinates: [5, 3] },
        { id: 'a_b0', coordinates: [1, 5] },
        { id: 'a_l0', coordinates: [-1, 1] },
      ],
      patches: [
        {
          plaquettes: [
            // Interior weight-4 plaquettes (square)
            { id: 0, weight: 4, shape: 'square', colour: 'blue', coordinates: ['d0', 'd1', 'd3', 'd4'] },
            { id: 1, weight: 4, shape: 'square', colour: 'red', coordinates: ['d1', 'd2', 'd4', 'd5'] },
            { id: 2, weight: 4, shape: 'square', colour: 'red', coordinates: ['d3', 'd4', 'd6', 'd7'] },
            { id: 3, weight: 4, shape: 'square', colour: 'blue', coordinates: ['d4', 'd5', 'd7', 'd8'] },
            // Boundary weight-2 plaquettes (semicircle)
            { id: 5, weight: 2, shape: 'semicircle', colour: 'blue', coordinates: ['d1', 'd2', 'a_t1'] },
            { id: 7, weight: 2, shape: 'semicircle', colour: 'red', coordinates: ['d5', 'd8', 'a_r1'] },
            { id: 8, weight: 2, shape: 'semicircle', colour: 'blue', coordinates: ['d6', 'd7', 'a_b0'] },
            { id: 10, weight: 2, shape: 'semicircle', colour: 'red', coordinates: ['d0', 'd3', 'a_l0'] },
          ],
        },
      ],
    },
  ],
};

const deltakit = new Deltakit('app');

// Simple toggle UI
const container = document.getElementById('app')!;
const header = document.createElement('div');
header.style.cssText =
  'position: absolute; top: 16px; left: 16px; z-index: 50; background: white; padding: 16px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
header.innerHTML = `
  <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Surface Code Patch</h2>
  <div style="display: flex; gap: 8px;">
    <button id="btn-dist1" style="padding: 8px 16px; background: #3D3DF0; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Distance 1</button>
    <button id="btn-dist3" style="padding: 8px 16px; background: #e0e0e0; color: black; border: none; border-radius: 4px; cursor: pointer; font-weight: 400;">Distance 3</button>
  </div>
`;
container.parentElement?.appendChild(header);

const btn1 = document.getElementById('btn-dist1')!;
const btn3 = document.getElementById('btn-dist3')!;

function setActive(active: HTMLElement, inactive: HTMLElement) {
  active.style.background = '#3D3DF0';
  active.style.color = 'white';
  active.style.fontWeight = '600';
  inactive.style.background = '#e0e0e0';
  inactive.style.color = 'black';
  inactive.style.fontWeight = '400';
}

btn1.addEventListener('click', () => {
  setActive(btn1, btn3);
  deltakit.render(exampleDistance1);
});

btn3.addEventListener('click', () => {
  setActive(btn3, btn1);
  deltakit.render(exampleDistance3);
});

// Render default
deltakit.render(exampleDistance1);
