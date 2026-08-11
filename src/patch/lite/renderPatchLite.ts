import * as THREE from 'three';
import type { PatchRenderData } from '@/patch/types';
import { buildPlaquetteShape } from '@/patch/geometry/buildPlaquetteShape';
import { colourToHex } from '@/config/colours';
import { convexHull } from '@/patch/geometry/convexHull';

export interface PatchRenderer {
  /** Render a single patch round, replacing whatever was drawn before. */
  render(item: PatchRenderData): void;
  /** Tear down the renderer and its resize listener. */
  dispose(): void;
}

/**
 * Imperative (no-React) 2D patch renderer for the lite build.
 *
 * Owns a single WebGL renderer / orthographic camera bound to `canvas` and
 * redraws the scene on each `render()` call, so it can be reused across rounds.
 */
export function createPatchRenderer(canvas: HTMLCanvasElement): PatchRenderer {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Fill the container responsively, matching the React build's <Canvas>:
  // a block-level canvas pinned to 100%/100% whose drawing buffer tracks the
  // parent size (rather than a one-off fixed pixel size).
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const parent = canvas.parentElement;
  const getSize = () => ({
    width: parent?.clientWidth || canvas.clientWidth || window.innerWidth,
    height: parent?.clientHeight || canvas.clientHeight || window.innerHeight,
  });

  let { width, height } = getSize();
  const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -100, 100);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  // updateStyle=false: keep the 100%/100% CSS above; only size the drawing buffer.
  renderer.setSize(width, height, false);

  // Bounds of the current item, kept so resize can re-fit the camera.
  let worldW = 1;
  let worldH = 1;
  let cx = 0;
  let cy = 0;

  const fitCamera = () => {
    ({ width, height } = getSize());
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.zoom = Math.min(width / worldW, height / worldH);
    camera.position.set(cx, cy, 10);
    camera.lookAt(cx, cy, 0);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  // Track the container itself (not just the window), like R3F does, so the
  // canvas stays filled when the layout around it changes.
  const onResize = () => fitCamera();
  let resizeObserver: ResizeObserver | null = null;
  if (parent && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(parent);
  } else {
    window.addEventListener('resize', onResize);
  }

  const clearScene = () => {
    for (const child of [...scene.children]) {
      scene.remove(child);
      const mesh = child as THREE.Mesh | THREE.LineSegments;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach(m => m.dispose());
      else material?.dispose();
    }
  };

  const render = (item: PatchRenderData) => {
    clearScene();

    const qubitMap = new Map(item.qubits.map(q => [q.id, q.coordinates] as [string, [number, number]]));

    for (const patch of item.patches) {
      for (const plaquette of patch.plaquettes) {
        const shape = buildPlaquetteShape(plaquette, qubitMap);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({ color: colourToHex(plaquette.colour), side: THREE.DoubleSide });
        scene.add(new THREE.Mesh(geometry, material));

        let linePoints: THREE.Vector3[];
        if (plaquette.shape === 'square') {
          const orderedCoords = convexHull(plaquette.coordinates.map(id => qubitMap.get(id)!));
          linePoints = [];
          for (let i = 0; i < orderedCoords.length; i++) {
            const current = orderedCoords[i];
            const next = orderedCoords[(i + 1) % orderedCoords.length];
            linePoints.push(new THREE.Vector3(current[0], current[1], 0.002));
            linePoints.push(new THREE.Vector3(next[0], next[1], 0.002));
          }
        } else {
          const points3d = shape.getPoints(48).map(p => new THREE.Vector3(p.x, p.y, 0.002));
          linePoints = [];
          for (let i = 0; i < points3d.length; i++) {
            linePoints.push(points3d[i]);
            linePoints.push(points3d[(i + 1) % points3d.length]);
          }
        }

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        scene.add(new THREE.LineSegments(lineGeometry, lineMaterial));
      }
    }

    for (const qubit of item.qubits) {
      const geometry = new THREE.CircleGeometry(0.06, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0x111111 });
      const dot = new THREE.Mesh(geometry, material);
      dot.position.set(qubit.coordinates[0], qubit.coordinates[1], 0.01);
      scene.add(dot);
    }

    const xs = item.qubits.map(q => q.coordinates[0]);
    const ys = item.qubits.map(q => q.coordinates[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padding = 0.5;
    worldW = maxX - minX + padding * 2;
    worldH = maxY - minY + padding * 2;
    cx = (minX + maxX) / 2;
    cy = (minY + maxY) / 2;

    fitCamera();
  };

  return {
    render,
    dispose: () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', onResize);
      clearScene();
      renderer.dispose();
    },
  };
}
