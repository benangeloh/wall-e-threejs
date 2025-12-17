import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; 
import { AssetLoader } from './utils/AssetLoader.js';
import { SceneManager } from './SceneManager.js';

import Scene1 from './scenes/Scene1.js';
import Scene2 from './scenes/Scene2.js';
import Scene3 from './scenes/Scene3.js';
import Scene4 from './scenes/Scene4.js';    
import Scene5 from './scenes/Scene5.js';
import Scene6 from './scenes/Scene6.js';
import Scene7 from './scenes/Scene7.js';
import Scene8 from './scenes/Scene8.js';
import Scene9 from './scenes/Scene9.js';

async function init() {
    // --- 1. THREE.JS BOILERPLATE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    scene.fog = new THREE.Fog(0x333333, 10, 50);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // --- 2. SETUP ORBIT CONTROLS (DEV TOOL) ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth motion
    controls.dampingFactor = 0.05;

    // --- 3. SETUP DEBUG UI ---
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'absolute';
    debugDiv.style.top = '10px';
    debugDiv.style.left = '10px';
    debugDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugDiv.style.color = 'lime';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.style.padding = '10px';
    debugDiv.style.pointerEvents = 'none'; // Let clicks pass through
    debugDiv.style.userSelect = 'none';
    document.body.appendChild(debugDiv);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- 4. LOAD ASSETS ---
    const assets = await AssetLoader.loadAll();

    // mixers setup
    const mixers = {
        boat: assets.boat.animations.length > 0 
            ? new THREE.AnimationMixer(assets.boat.scene)
            : null,

        wallE: assets.wallE.animations.length > 0 
            ? new THREE.AnimationMixer(assets.wallE.scene)
            : null
    };

    // add models to scene immediately
    scene.add(assets.boat.scene);
    scene.add(assets.wallE.scene);

    // --- 5. INIT SCENE MANAGER ---
    const context = {
        scene,
        camera,
        renderer,
        models: assets,
        mixers: mixers
    };

    const manager = new SceneManager(context);
    
    manager.setScenes([
        // Scene1,
        // Scene2,
        // Scene3,  
        // Scene4,
        // Scene5,
        // Scene6,
        // Scene7,
        // Scene8,
        Scene9
    ]);

    // --- 6. START LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();

        // 1. Update controls
        controls.update();

        // 2. Update Debug Info
        // Rounds to 2 decimal places for readability
        const cx = camera.position.x.toFixed(2);
        const cy = camera.position.y.toFixed(2);
        const cz = camera.position.z.toFixed(2);
        
        // OrbitControls "target" is effectively the lookAt point
        const tx = controls.target.x.toFixed(2);
        const ty = controls.target.y.toFixed(2);
        const tz = controls.target.z.toFixed(2);

        debugDiv.innerHTML = `
            <strong>Camera Pos:</strong> ${cx}, ${cy}, ${cz}<br>
            <strong>LookAt:</strong> ${tx}, ${ty}, ${tz}
        `;

        // 3. update global mixers
        Object.values(mixers).forEach(mixer => {
            if (mixer) mixer.update(delta);
        });

        // 4. update scene logic
        manager.update(delta);

        renderer.render(scene, camera);
    }

    manager.start();
    animate();

    // resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

init();