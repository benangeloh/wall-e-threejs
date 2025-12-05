import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 1. SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333); 
scene.fog = new THREE.Fog(0x333333, 10, 50);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4, 6, 12); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-1, 6, 0);

// --- 2. VARIABLES ---
let wallEMixer; 
let boatMixer; 
let wallEModel = null;
let boatModel = null;
const clock = new THREE.Clock();
const loader = new GLTFLoader();

// --- 3. LOAD MODELS ---
// A. Boat
loader.load('lcvp_higgins_boat_1945.glb', (gltf) => {
    boatModel = gltf.scene;
    boatModel.scale.set(1.2, 1.2, 1.2); 
    boatModel.position.set(0, -1.1, -15);
    scene.add(boatModel);

    if (gltf.animations.length > 0) {
        boatMixer = new THREE.AnimationMixer(boatModel);
        boatMixer.clipAction(gltf.animations[0]).play();
    }
});

// B. Wall-E
loader.load('wall-eanimated.glb', (gltf) => {
    wallEModel = gltf.scene;
    scene.add(wallEModel);

    wallEModel.position.y = 3.5; 
    wallEModel.position.z = 1; 
    wallEModel.rotation.y = 0; 

    // Animation
    wallEMixer = new THREE.AnimationMixer(wallEModel);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, 'Scene') || clips[0];
    if (clip) {
        wallEMixer.clipAction(clip).play();
    }
});

// --- 4. ANIMATION LOOP ---
function animate() {
    window.existingAnimationLoop = requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (wallEMixer) wallEMixer.update(delta);
    if (boatMixer) boatMixer.update(delta);

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});