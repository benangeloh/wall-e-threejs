import * as THREE from 'three';
import { AssetLoader } from './utils/AssetLoader.js';
import { SceneManager } from './SceneManager.js';

import Scene1 from './scenes/Scene1.js';
import Scene2 from './scenes/Scene2.js';

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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- 2. LOAD ASSETS ---
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


    // add models to scene immediately (visibility controllable inside scene modules)
    scene.add(assets.boat.scene);
    scene.add(assets.wallE.scene);

    // --- 3. INIT SCENE MANAGER ---
    const context = {
        scene,
        camera,
        renderer,
        models: assets,
        mixers: mixers
    };

    const manager = new SceneManager(context);
    
    manager.setScenes([
        Scene1,
        // Scene2
    ]);

    // --- 4. START LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();

        // 1. update global mixers
        Object.values(mixers).forEach(mixer => {
            if (mixer) mixer.update(delta);
        });


        // 2. update scene logic
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