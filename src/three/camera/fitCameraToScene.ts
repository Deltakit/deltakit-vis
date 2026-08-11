import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

export function fitCameraToScene(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  controls: OrbitControls,
  viewportSize?: { width: number; height: number },
  direction: THREE.Vector3 = new THREE.Vector3(0.6, -1, 0.5),
  up: THREE.Vector3 = new THREE.Vector3(0, 0, 1)
): void {
  scene.updateMatrixWorld(true);

  camera.up.copy(up);

  // Calculate the combined bounding box of all meshes in the scene
  const combinedBox = new THREE.Box3();
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.userData.owner) {
      combinedBox.union(new THREE.Box3().setFromObject(object));
    }
  });

  if (combinedBox.isEmpty()) return;

  const center = new THREE.Vector3();
  combinedBox.getCenter(center);

  const boxSize = new THREE.Vector3();
  combinedBox.getSize(boxSize);

  const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z, 1);
  const paddingMultiplier = 2.0;
  const normalizedDirection = direction.clone().normalize();

  if (camera instanceof THREE.PerspectiveCamera) {
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * paddingMultiplier;
    camera.position.copy(center.clone().add(normalizedDirection.multiplyScalar(cameraDistance)));
  } else {
    const cameraDistance = 500;
    camera.position.copy(center.clone().add(normalizedDirection.multiplyScalar(cameraDistance)));
    if (viewportSize) {
      const viewportMinSize = Math.min(viewportSize.width, viewportSize.height);
      camera.zoom = viewportMinSize / (maxDim * paddingMultiplier);
      camera.updateProjectionMatrix();
    }
  }

  controls.target.copy(center);
  controls.update();
}
