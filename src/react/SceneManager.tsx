import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';

import type { RenderData } from '@/types/renderData';
import type { SurfaceInfo, ColorProfile } from '@/types/three';
import type { DeltakitChangeViewEvent } from '@/react/events';
import { createSurface } from '@/three/renderer/createSurface';
import { createSides } from '@/three/renderer/createSides';
import { Direction, type DirectionType } from '@/primitives/Direction';
import { fitCameraToScene } from '@/three/camera/fitCameraToScene';

const CoordinateMarker = () => (
  <group userData={{ noExport: true }}>
    <primitive object={new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 2000, 0xff0000, 0, 0)} />
    <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2000, 0x00ff00, 0, 0)} />
    <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 2000, 0x0000ff, 0, 0)} />
  </group>
);

const GridOverlay = () => (
  <group userData={{ noExport: true }} rotation={[Math.PI / 2, 0, 0]}>
    <gridHelper args={[1998, 1998, '#888888', '#cccccc']} />
  </group>
);

export interface SceneManagerProps {
  data: RenderData;
  colorProfile: ColorProfile;
  showCoordinate: boolean;
  showGrid: boolean;
  cameraType: 'perspective' | 'isometric';
}

export const SceneManager = ({ data, colorProfile, showCoordinate, showGrid, cameraType }: SceneManagerProps) => {
  const { scene, camera, size, gl } = useThree();
  const surfacesById = useRef(new Map<string | number, SurfaceInfo>());
  const controlsRef = useRef<any>(null);
  const isCPressed = useRef(false);
  const lastMeshes = useRef<THREE.Mesh[]>([]);
  const lastCameraType = useRef(cameraType);

  const meshes = useMemo(() => {
    surfacesById.current.clear();
    const resultMeshes: THREE.Mesh[] = [];

    if (data.ops) {
      for (const op of data.ops) {
        if (op.id === undefined || !op.type) {
          console.warn('deltakit: skipping op with missing id or type', op);
          continue;
        }
        if (op.type === 'surface') {
          const mesh = createSurface(op.size, op.location, op.startHeight, op.colour, op.id, surfacesById.current, colorProfile);
          resultMeshes.push(mesh);
        }
      }

      for (const op of data.ops) {
        if (op.type === 'side') {
          if (!op.fromSurfaceId || !op.toSurfaceId) {
            console.warn('deltakit: skipping side op with missing surface refs', op);
            continue;
          }
          try {
            const mesh = createSides(op.fromSurfaceId, op.toSurfaceId, op.colourScheme, surfacesById.current, op.sides, op.id, colorProfile);
            resultMeshes.push(mesh);
          } catch (err) {
            console.warn('deltakit: failed to create side mesh', err);
          }
        }
      }
    }

    if (data.removeSurfaceFromAxis) {
      const dir = new Direction(data.removeSurfaceFromAxis as DirectionType);
      resultMeshes.forEach((mesh) => {
        if (mesh.userData.owner && typeof mesh.userData.owner.removeSurface === 'function') {
          mesh.userData.owner.removeSurface(dir);
        }
      });
    }

    return resultMeshes;
  }, [data, colorProfile]);

  // Z-up engineering convention
  useEffect(() => {
    camera.up.set(0, 0, 1);
  }, [camera]);

  // Camera keyboard shortcuts and view-snap events
  useEffect(() => {
    type ViewConfig = { direction: THREE.Vector3; up: THREE.Vector3 };
    const viewConfigs: Record<string, { primary: ViewConfig; alternate?: ViewConfig }> = {
      'Top':    { primary: { direction: new THREE.Vector3(0, 0, 1),  up: new THREE.Vector3(0, 1, 0) } },
      'Bottom': { primary: { direction: new THREE.Vector3(0, 0, -1), up: new THREE.Vector3(1, 0, 0) } },
      'Front':  { primary: { direction: new THREE.Vector3(1, 0, 0),  up: new THREE.Vector3(0, 0, 1) } },
      'Back':   { primary: { direction: new THREE.Vector3(-1, 0, 0), up: new THREE.Vector3(0, 0, 1) } },
      'Right':  { primary: { direction: new THREE.Vector3(0, 1, 0),  up: new THREE.Vector3(0, 0, 1) } },
      'Left':   { primary: { direction: new THREE.Vector3(0, -1, 0), up: new THREE.Vector3(0, 0, 1) } },
      'KeyZ': {
        primary:   { direction: new THREE.Vector3(0, 0, 1),  up: new THREE.Vector3(0, 1, 0) },
        alternate: { direction: new THREE.Vector3(0, 0, -1), up: new THREE.Vector3(1, 0, 0) },
      },
      'KeyX': {
        primary:   { direction: new THREE.Vector3(1, 0, 0),  up: new THREE.Vector3(0, 0, 1) },
        alternate: { direction: new THREE.Vector3(-1, 0, 0), up: new THREE.Vector3(0, 0, 1) },
      },
      'KeyY': {
        primary:   { direction: new THREE.Vector3(0, 1, 0),  up: new THREE.Vector3(0, 0, 1) },
        alternate: { direction: new THREE.Vector3(0, -1, 0), up: new THREE.Vector3(0, 0, 1) },
      },
      'Digit1': { primary: { direction: new THREE.Vector3(0, 0, 1),  up: new THREE.Vector3(0, 1, 0) } },
      'Digit2': { primary: { direction: new THREE.Vector3(0, 0, -1), up: new THREE.Vector3(1, 0, 0) } },
      'Digit3': { primary: { direction: new THREE.Vector3(1, 0, 0),  up: new THREE.Vector3(0, 0, 1) } },
      'Digit4': { primary: { direction: new THREE.Vector3(-1, 0, 0), up: new THREE.Vector3(0, 0, 1) } },
      'Digit5': { primary: { direction: new THREE.Vector3(0, 1, 0),  up: new THREE.Vector3(0, 0, 1) } },
      'Digit6': { primary: { direction: new THREE.Vector3(0, -1, 0), up: new THREE.Vector3(0, 0, 1) } },
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) return;
      if (e.code === 'KeyC') isCPressed.current = true;
      if (e.code === 'Space') {
        e.preventDefault();
        if (controlsRef.current) {
          controlsRef.current.mouseButtons.LEFT = THREE.MOUSE.PAN;
          gl.domElement.style.cursor = 'grab';
        }
      }
      const config = viewConfigs[e.code];
      if (isCPressed.current && config) {
        e.preventDefault();
        let targetView = config.primary;
        if (config.alternate && controlsRef.current) {
          const currentOffset = new THREE.Vector3().subVectors(camera.position, controlsRef.current.target).normalize();
          if (currentOffset.dot(config.primary.direction.clone().normalize()) > 0.95) {
            targetView = config.alternate;
          }
        }
        if (controlsRef.current) {
          fitCameraToScene(scene, camera as THREE.PerspectiveCamera | THREE.OrthographicCamera, controlsRef.current, size, targetView.direction, targetView.up);
        }
      } else if (e.key.toLowerCase() === 'r') {
        if (controlsRef.current) fitCameraToScene(scene, camera as THREE.PerspectiveCamera | THREE.OrthographicCamera, controlsRef.current, size);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyC') isCPressed.current = false;
      if (e.code === 'Space') {
        if (controlsRef.current) {
          controlsRef.current.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
          gl.domElement.style.cursor = 'auto';
        }
      }
    };

    const handleChangeView = (e: Event) => {
      const customEvent = e as DeltakitChangeViewEvent;
      const config = viewConfigs[customEvent.detail.view];
      if (config && controlsRef.current) {
        fitCameraToScene(scene, camera as THREE.PerspectiveCamera | THREE.OrthographicCamera, controlsRef.current, size, config.primary.direction, config.primary.up);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('deltakit-change-view', handleChangeView);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('deltakit-change-view', handleChangeView);
    };
  }, [scene, camera, size, gl, meshes]);

  // Initial camera fit whenever meshes or camera type changes
  useEffect(() => {
    if (controlsRef.current && (lastMeshes.current !== meshes || lastCameraType.current !== cameraType) && meshes.length > 0) {
      setTimeout(() => {
        fitCameraToScene(scene, camera as THREE.PerspectiveCamera | THREE.OrthographicCamera, controlsRef.current!, size);
        lastMeshes.current = meshes;
        lastCameraType.current = cameraType;
      }, 0);
    }
  }, [meshes, scene, camera, cameraType, size]);

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    const intersect = event.intersections?.[0];
    if (!intersect) return;
    const listeners = intersect.object.userData.clickListeners;
    if (listeners) listeners.forEach((cb: (i: unknown) => void) => cb(intersect));
  };

  return (
    <>
      <group onPointerDown={handlePointerDown}>
        {meshes.map((mesh, idx) => (
          <primitive key={mesh.userData.id !== undefined ? String(mesh.userData.id) : idx} object={mesh} />
        ))}
      </group>
      {showCoordinate && <CoordinateMarker />}
      {showGrid && <GridOverlay />}
      <GizmoHelper alignment="bottom-left" margin={[80, 80]} name="GizmoHelper">
        <GizmoViewport axisColors={['#ff3232', '#32ff32', '#3232ff']} labelColor="black" />
      </GizmoHelper>
      <OrbitControls ref={controlsRef} makeDefault enableDamping />
    </>
  );
};
