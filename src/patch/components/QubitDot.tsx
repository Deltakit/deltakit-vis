import type { QubitData } from '../types';

export function QubitDot({ qubit }: { qubit: QubitData }) {
  return (
    <mesh position={[qubit.coordinates[0], qubit.coordinates[1], 0.01]}>
      <circleGeometry args={[0.06, 16]} />
      <meshBasicMaterial color={0x111111} />
    </mesh>
  );
}
