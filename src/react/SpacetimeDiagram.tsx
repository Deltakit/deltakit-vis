import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei';

import type { ColorProfile } from '@/types/three';
import type { RenderData } from '@/types/renderData';
import { SceneManager } from '@/react/SceneManager';
import { CanvasSettings } from '@/react/user-interface/canvas-settings';
import { CameraShortcutsHint } from '@/react/key-shortcuts/camera-shortcuts-hint';
import deltaKitLogo from '@/assets/logo/Deltakit_logo.svg';

export interface SpacetimeDiagramProps {
  data: RenderData;
  colorProfile?: ColorProfile;
  showCoordinate?: boolean;
  showGrid?: boolean;
  cameraType?: 'perspective' | 'isometric';
  showSettingsPanel?: boolean;
}

export const SpacetimeDiagram = ({
  data,
  colorProfile = 'standard',
  showCoordinate = true,
  showGrid = false,
  cameraType = 'perspective',
  showSettingsPanel = true,
}: SpacetimeDiagramProps) => {
  const [localColorProfile, setLocalColorProfile] = React.useState<ColorProfile>(colorProfile);
  const [localShowCoordinate, setLocalShowCoordinate] = React.useState(showCoordinate);
  const [localShowGrid, setLocalShowGrid] = React.useState(showGrid);
  const [localCameraType, setLocalCameraType] = React.useState<'perspective' | 'isometric'>(cameraType);
  const [isCPressed, setIsCPressed] = React.useState(false);
  const version = process.env.npm_package_version ? `v${process.env.npm_package_version}` : '';

  // Sync external prop changes into local state
  React.useEffect(() => { setLocalColorProfile(colorProfile); }, [colorProfile]);
  React.useEffect(() => { setLocalShowCoordinate(showCoordinate); }, [showCoordinate]);
  React.useEffect(() => { setLocalShowGrid(showGrid); }, [showGrid]);
  React.useEffect(() => { setLocalCameraType(cameraType); }, [cameraType]);

  // Track C key for camera shortcuts hint
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses while the user is typing in a form field to avoid triggering shortcuts unintentionally.
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) return;
      if (e.code === 'KeyC') setIsCPressed(true);
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'KeyC') setIsCPressed(false); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 right-0 z-50">
        <nav className="w-fit bg-white">
          <div className="mx-auto flex h-8 items-center px-3 gap-3">
            <div className="text-sm font-semibold uppercase">Logical Assembly</div>
            <span className="text-xs font-normal text-gray-500">{version}</span>
          </div>
        </nav>
      </div>

      {showSettingsPanel && (
        <div className="absolute top-4 right-4 z-50">
          <CanvasSettings
            showCoordinate={localShowCoordinate}
            setShowCoordinate={setLocalShowCoordinate}
            showGrid={localShowGrid}
            setShowGrid={setLocalShowGrid}
            colorProfile={localColorProfile}
            onSaveProfile={setLocalColorProfile}
            cameraType={localCameraType}
            onSaveCamera={setLocalCameraType}
          />
        </div>
      )}

      <Canvas
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace, preserveDrawingBuffer: true }}
        className="w-full h-full"
      >
        {localCameraType === 'perspective' ? (
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={20} up={[0, 0, 1]} />
        ) : (
          <OrthographicCamera makeDefault position={[0, 0, 5]} up={[0, 0, 1]} near={-5000} far={5000} />
        )}
        <color attach="background" args={[0xECECEC]} />
        <ambientLight intensity={0.5} color={0xffffff} />
        <hemisphereLight intensity={0.3} groundColor={0xffffff} color={0xffffff} />
        <directionalLight intensity={0.8} color={0xffffff} position={[5, 10, 5]} castShadow />

        <SceneManager
          data={data}
          colorProfile={localColorProfile}
          showCoordinate={localShowCoordinate}
          showGrid={localShowGrid}
          cameraType={localCameraType}
        />
      </Canvas>

      {isCPressed && <CameraShortcutsHint />}

      {/* Deltakit Logo */}
      <div className="absolute bottom-6 right-6 z-50">
        <img src={deltaKitLogo} alt="Deltakit Logo" className="w-24 opacity-50" />
      </div>
    </div>
  );
};
