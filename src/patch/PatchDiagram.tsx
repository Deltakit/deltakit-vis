import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import type { PatchRenderData } from './types';
import { PatchScene } from './components/PatchScene';
import { PatchCameraFit } from './components/PatchCameraFit';

export function PatchDiagram({ data }: { data: PatchRenderData }) {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <OrthographicCamera makeDefault position={[0, 0, 10]} near={-100} far={100} />
      <color attach="background" args={['#f0f0f0']} />
      <PatchScene data={data} />
      <PatchCameraFit data={data} />
    </Canvas>
  );
}
