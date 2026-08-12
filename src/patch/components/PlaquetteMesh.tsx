import { useMemo } from 'react';
import * as THREE from 'three';
import type { PlaquetteData } from '../types';
import { buildPlaquetteShape } from '../geometry/buildPlaquetteShape';
import { colourToHex } from '@/config/colours';
import { convexHull } from '../geometry/convexHull';

interface Props {
  plaquette: PlaquetteData;
  qubitMap: Map<string, [number, number]>;
}

export function PlaquetteMesh({ plaquette, qubitMap }: Props) {
  const { geometry, lineGeometry } = useMemo(() => {
    const shape = buildPlaquetteShape(plaquette, qubitMap);
    const shapeGeometry = new THREE.ShapeGeometry(shape);

    let line: THREE.BufferGeometry;

    if (plaquette.shape === 'square') {
      // Square plaquettes: draw edges connecting the data qubits
      const coords = plaquette.coordinates.map(id => qubitMap.get(id)!);
      const orderedCoords = convexHull(coords);

      // Create line segments: connect each pair of adjacent vertices
      const points3d: THREE.Vector3[] = [];
      for (let i = 0; i < orderedCoords.length; i++) {
        const current = orderedCoords[i];
        const next = orderedCoords[(i + 1) % orderedCoords.length];
        points3d.push(new THREE.Vector3(current[0], current[1], 0.002));
        points3d.push(new THREE.Vector3(next[0], next[1], 0.002));
      }
      line = new THREE.BufferGeometry().setFromPoints(points3d);
    } else {
      // Semicircle plaquettes: smooth curve from shape outline
      const curvePoints = shape.getPoints(48);
      const points3d = curvePoints.map(p => new THREE.Vector3(p.x, p.y, 0.002));

      // Create line segment pairs for smooth curve
      const segmentPoints: THREE.Vector3[] = [];
      for (let i = 0; i < points3d.length; i++) {
        segmentPoints.push(points3d[i]);
        segmentPoints.push(points3d[(i + 1) % points3d.length]); // Connect to next, wrapping to start
      }
      line = new THREE.BufferGeometry().setFromPoints(segmentPoints);
    }

    return { geometry: shapeGeometry, lineGeometry: line };
  }, [plaquette, qubitMap]);

  const colour = colourToHex(plaquette.colour);

  return (
    <>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={colour} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={0x000000} linewidth={2} />
      </lineSegments>
    </>
  );
}




