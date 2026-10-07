import type { GridLayout } from '../geometry/computeGridLayout';

// Lines either side of the origin; even, so a line passes through the origin.
const DIVISIONS = 1000;
const LINE_COLOUR = '#cccccc';

/**
 * Grid in the patch (XY) plane with one cell per square plaquette, drawn just
 * behind the plaquettes so it shows through the gaps between them.
 */
export function PatchGrid({ layout }: { layout: GridLayout }) {
  const { spacing, origin } = layout;
  return (
    <group
      userData={{ noExport: true }}
      position={[origin[0], origin[1], -0.01]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <gridHelper args={[DIVISIONS * spacing, DIVISIONS, LINE_COLOUR, LINE_COLOUR]} />
    </group>
  );
}
