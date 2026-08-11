import React, { useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei';

import type { ColorProfile } from '@/types/three';
import type { RenderData } from '@/types/renderData';
import type { PatchRenderData } from '@/patch/types';
import { SceneManager } from '@/react/SceneManager';
import { PatchScene } from '@/patch/components/PatchScene';
import { PatchCameraFit } from '@/patch/components/PatchCameraFit';
import { CanvasSettings } from '@/react/user-interface/canvas-settings';
import { Toolbar, type ToolId } from '@/react/user-interface/toolbar';
import { SurfaceCodePanel } from '@/react/user-interface/surface-code-panel';
import { SlicePlanesOverlay } from '@/react/three/SlicePlanesOverlay';
import { deriveSlices } from '@/react/slices';
import { CameraShortcutsHint } from '@/react/key-shortcuts/camera-shortcuts-hint';
import deltaKitLogo from '@/assets/logo/Deltakit_logo.svg';

export interface VisualisationWrapperProps {
  spacetimeData?: RenderData;
  /** Per-round patch items; the first round is rendered. */
  patchRounds?: PatchRenderData[];
  colorProfile?: ColorProfile;
  showCoordinate?: boolean;
  showGrid?: boolean;
  cameraType?: 'perspective' | 'isometric';
  showSettingsPanel?: boolean;
  /** Show the surface-code tool and its slice panel over the spacetime view. Off by default. */
  showSurfaceCodePanel?: boolean;
}

export const VisualisationWrapper = ({
  spacetimeData,
  patchRounds,
  colorProfile = 'standard',
  showCoordinate = true,
  showGrid = false,
  cameraType = 'perspective',
  showSettingsPanel = true,
  showSurfaceCodePanel = false,
}: VisualisationWrapperProps) => {
  const patchData = patchRounds?.[0];
  const [mode, setMode] = useState<'spacetime' | 'patch'>(spacetimeData ? 'spacetime' : 'patch');
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);
  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);
  const [localColorProfile, setLocalColorProfile] = useState<ColorProfile>(colorProfile);
  const [localShowCoordinate, setLocalShowCoordinate] = useState(showCoordinate);
  const [localShowGrid, setLocalShowGrid] = useState(showGrid);
  const [localCameraType, setLocalCameraType] = useState<'perspective' | 'isometric'>(cameraType);
  const [isCPressed, setIsCPressed] = useState(false);
  const cPressed = React.useRef(false);
  const version = process.env.npm_package_version ? `v${process.env.npm_package_version}` : '';

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) return;
      if (e.code === 'KeyC') {
        cPressed.current = true;
        setIsCPressed(true);
      }
      // Toolbar shortcuts. `C` is held for the camera view bindings, so ignore
      // anything pressed alongside it.
      if (!showSurfaceCodePanel || cPressed.current) return;
      if (e.code === 'KeyS') {
        setActiveTool('surface-code');
      } else if (e.code === 'KeyV' || e.code === 'Escape') {
        setActiveTool('select');
        setSelectedSliceId(null);
        setHoveredSliceId(null);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyC') {
        cPressed.current = false;
        setIsCPressed(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [showSurfaceCodePanel]);

  const showModeToggle = spacetimeData && patchData;
  const currentData = mode === 'spacetime' ? spacetimeData : patchData;

  const slices = React.useMemo(() => deriveSlices(spacetimeData), [spacetimeData]);
  const showToolbar = showSurfaceCodePanel && mode === 'spacetime';
  /** Slice mode: the panel is open, so the slice planes are live in the scene. */
  const sliceMode = showToolbar && activeTool === 'surface-code';

  const exitSliceMode = () => {
    setActiveTool('select');
    setSelectedSliceId(null);
    setHoveredSliceId(null);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 right-0 z-50">
        <nav className="w-fit bg-white">
          <div className="mx-auto flex h-8 items-center px-3 gap-3">
            <div className="text-sm font-semibold uppercase">Logical Assembly</div>
            <span className="text-xs font-normal text-gray-500">{version}</span>
            {showModeToggle && (
              <>
                <div className="w-px h-6 bg-gray-300" />
                <button
                  onClick={() => setMode('spacetime')}
                  style={{
                    padding: '2px 8px',
                    fontSize: '12px',
                    backgroundColor: mode === 'spacetime' ? '#3D3DF0' : '#e0e0e0',
                    color: mode === 'spacetime' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: mode === 'spacetime' ? '600' : '400',
                  }}
                >
                  Spacetime
                </button>
                <button
                  onClick={() => setMode('patch')}
                  style={{
                    padding: '2px 8px',
                    fontSize: '12px',
                    backgroundColor: mode === 'patch' ? '#3D3DF0' : '#e0e0e0',
                    color: mode === 'patch' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: mode === 'patch' ? '600' : '400',
                  }}
                >
                  Patch
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {showSettingsPanel && mode === 'spacetime' && (
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

      {currentData && (
        <Canvas
          gl={{
            antialias: true,
            toneMapping: THREE.NoToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
            preserveDrawingBuffer: true,
          }}
          className="w-full h-full"
        >
          {mode === 'spacetime' ? (
            <>
              {localCameraType === 'perspective' ? (
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={20} up={[0, 0, 1]} />
              ) : (
                <OrthographicCamera
                  makeDefault
                  position={[0, 0, 5]}
                  up={[0, 0, 1]}
                  near={-5000}
                  far={5000}
                />
              )}
              <color attach="background" args={[0xececec]} />
              <ambientLight intensity={0.5} color={0xffffff} />
              <hemisphereLight intensity={0.3} groundColor={0xffffff} color={0xffffff} />
              <directionalLight intensity={0.8} color={0xffffff} position={[5, 10, 5]} castShadow />
              {spacetimeData && (
                <SceneManager
                  data={spacetimeData}
                  colorProfile={localColorProfile}
                  showCoordinate={localShowCoordinate}
                  showGrid={localShowGrid}
                  cameraType={localCameraType}
                />
              )}
              {spacetimeData && sliceMode && (
                <SlicePlanesOverlay
                  data={spacetimeData}
                  slices={slices}
                  selectedId={selectedSliceId}
                  hoveredId={hoveredSliceId}
                  onHoverChange={setHoveredSliceId}
                  onSelectId={setSelectedSliceId}
                />
              )}
            </>
          ) : (
            <>
              <OrthographicCamera makeDefault position={[0, 0, 10]} near={-100} far={100} />
              <color attach="background" args={['#f0f0f0']} />
              {patchData && <PatchScene data={patchData} />}
              {patchData && <PatchCameraFit data={patchData} />}
            </>
          )}
        </Canvas>
      )}

      {showToolbar && (
        <div className="absolute top-16 right-4 bottom-4 z-40 flex items-stretch gap-2 pointer-events-none">
          {sliceMode && (
            <div className="flex self-stretch pointer-events-auto">
              <SurfaceCodePanel
                slices={slices}
                selectedId={selectedSliceId}
                onSelectId={setSelectedSliceId}
                hoveredId={hoveredSliceId}
                onHoverChange={setHoveredSliceId}
                onClose={exitSliceMode}
              />
            </div>
          )}
          <div className="flex flex-col justify-start pointer-events-auto">
            <Toolbar
              activeTool={activeTool}
              onToolChange={(tool) => {
                if (tool === 'surface-code') setActiveTool(tool);
                else exitSliceMode();
              }}
            />
          </div>
        </div>
      )}

      {isCPressed && <CameraShortcutsHint />}

      <div className="absolute bottom-6 right-6 z-50">
        <img src={deltaKitLogo} alt="Deltakit Logo" className="w-24 opacity-50" />
      </div>
    </div>
  );
};
