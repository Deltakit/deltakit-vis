import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

import { handleSceneClick } from '@/three/interactions/handleSceneClick';
import { fitCameraToScene } from '@/three/camera/fitCameraToScene';
import { Direction } from '@/primitives/Direction';

export type SurfaceInfo = {
  dimensions: number[];
  coordinates: number[];
};

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private controls: OrbitControls;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    const width = canvas.parentElement?.clientWidth ?? window.innerWidth;
    const height = canvas.parentElement?.clientHeight ?? window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      width / height, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    this.camera.position.z = 5;
    this.camera.up.set(0, 0, 1);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    const axisHelper = new THREE.AxesHelper(5);
    axisHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff));
    this.scene.add(axisHelper, );

    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('click', (event) => this.onClick(event));

    this.animate();
  }

  public addToScene(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  // Remove surfaces from the scene based on the specified direction
  public removeSurfaceFromAll(direction: Direction): void {
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.userData.owner) {
        const owner = object.userData.owner;
        if (typeof owner.removeSurface === 'function') {
          owner.removeSurface(direction);
        }
      }
    });
  }

  // Change camera angle and set a distance for it to show the entire model in the view
  public fitCameraToScene(): void {
    fitCameraToScene(this.scene, this.camera, this.controls);
  }

  private onWindowResize(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.parentElement?.clientWidth ?? window.innerWidth;
    const height = canvas.parentElement?.clientHeight ?? window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onClick(event: MouseEvent): void {
    handleSceneClick({
      event,
      camera: this.camera,
      raycaster: this.raycaster,
      mouse: this.mouse,
      scene: this.scene,
    });
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
