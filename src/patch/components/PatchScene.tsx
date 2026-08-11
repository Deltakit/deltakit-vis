import { useMemo } from 'react';
import type { PatchRenderData } from '../types';
import { PlaquetteMesh } from './PlaquetteMesh';
import { QubitDot } from './QubitDot';

export function PatchScene({ data }: { data: PatchRenderData }) {
  const qubitMap = useMemo(
    () => new Map(data.qubits.map(q => [q.id, q.coordinates] as [string, [number, number]])),
    [data.qubits],
  );

  return (
    <>
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


