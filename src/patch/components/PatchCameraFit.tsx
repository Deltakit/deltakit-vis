import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { PatchRenderData } from '../types';

/**
 * Fits the orthographic camera to the patch's qubit bounds so the patch fills
 * the canvas. Without this the camera stays at zoom 1 and a patch spanning ~1
 * world unit renders as a near-invisible speck.
 */
export function PatchCameraFit({ data }: { data: PatchRenderData }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    if (data.qubits.length === 0) return;

    const xs = data.qubits.map(q => q.coordinates[0]);
    const ys = data.qubits.map(q => q.coordinates[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padding = 0.5;
    const worldW = maxX - minX + padding * 2;
    const worldH = maxY - minY + padding * 2;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    camera.zoom = Math.min(size.width / worldW, size.height / worldH);
    camera.position.set(cx, cy, 10);
    camera.lookAt(cx, cy, 0);
    camera.updateProjectionMatrix();
  }, [data, camera, size]);

  return null;
}
