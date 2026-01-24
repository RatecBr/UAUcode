import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Overlay3D {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private container: HTMLElement;
    private model: THREE.Object3D | null = null;
    private animationId: number | null = null;
    private loader: GLTFLoader;

    constructor(container: HTMLElement) {
        this.container = container;

        // Scene
        this.scene = new THREE.Scene();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(2, 5, 5);
        this.scene.add(dirLight);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Loader
        this.loader = new GLTFLoader();

        // Handle Resize
        window.addEventListener('resize', this.onResize.bind(this));
    }

    private onResize() {
        if (!this.container) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public async loadModel(url: string) {
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }

        return new Promise<void>((resolve, reject) => {
            this.loader.load(url, (gltf) => {
                this.model = gltf.scene;
                // Center model
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.sub(center);

                // Add to scene
                this.scene.add(this.model);
                resolve();
            }, undefined, reject);
        });
    }

    private animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        if (this.model) {
            // Rotate model slightly for effect
            this.model.rotation.y += 0.01;
        }

        this.renderer.render(this.scene, this.camera);
    };

    public show() {
        if (!this.container.contains(this.renderer.domElement)) {
            this.container.appendChild(this.renderer.domElement);
            this.animate();
        }
    }

    public hide() {
        if (this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }

    public dispose() {
        this.hide();
        window.removeEventListener('resize', this.onResize.bind(this));
        this.renderer.dispose();
    }
}
