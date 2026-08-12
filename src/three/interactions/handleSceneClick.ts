import * as THREE from 'three';

export function handleSceneClick(params: {
  event: MouseEvent;
  camera: THREE.Camera;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  scene: THREE.Scene;
}): void {
  const { event, camera, raycaster, mouse, scene } = params;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length === 0) return;

  // Trigger click listener on the first object facing raycaster source
  for (const intersect of intersects) {
    const listeners = intersect.object.userData.clickListeners;
    if (listeners && Array.isArray(listeners)) {
      listeners.forEach((callback: (i: THREE.Intersection) => void) => callback(intersect));
      break;
    }
  }
}
