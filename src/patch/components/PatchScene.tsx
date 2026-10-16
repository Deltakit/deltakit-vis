import { useMemo } from 'react';
import type { PatchRenderData } from '../types';
import { PlaquetteMesh } from './PlaquetteMesh';
import { QubitDot } from './QubitDot';
import { PatchGrid } from './PatchGrid';
import { computeGridLayout } from '../geometry/computeGridLayout';

export function PatchScene({ data, showGrid = false }: { data: PatchRenderData; showGrid?: boolean }) {
  const qubitMap = useMemo(
    () => new Map(data.qubits.map(q => [q.id, q.coordinates] as [string, [number, number]])),
    [data.qubits],
  );
  const gridLayout = useMemo(() => computeGridLayout(data.qubits), [data.qubits]);

  return (
    <>
      {showGrid && <PatchGrid layout={gridLayout} />}
      {data.patches.flatMap((patch, pi) =>
        patch.plaquettes.map(plaquette => (
          <PlaquetteMesh
            key={`${pi}-${plaquette.id}`}
            plaquette={plaquette}
            qubitMap={qubitMap}
          />
        )),
      )}
      {data.qubits.map(qubit => (
        <QubitDot key={qubit.id} qubit={qubit} />
      ))}
    </>
  );
}


