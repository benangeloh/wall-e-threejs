import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; 
import { AssetLoader } from './utils/AssetLoader.js';
import { SceneManager } from './SceneManager.js';
import { Sky } from 'three/addons/objects/Sky.js';

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

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);

    // --- 2. CONTROLS & DEBUG UI SETUP ---
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.enabled = false;

    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'absolute';
    debugDiv.style.top = '10px';
    debugDiv.style.left = '10px';
    debugDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugDiv.style.color = 'lime';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.style.padding = '10px';
    debugDiv.style.pointerEvents = 'none';
    debugDiv.style.display = 'none';
    document.body.appendChild(debugDiv);

    const fadeOverlay = document.createElement('div');
    fadeOverlay.style.position = 'fixed';
    fadeOverlay.style.top = 0;
    fadeOverlay.style.left = 0;
    fadeOverlay.style.width = '100vw';
    fadeOverlay.style.height = '100vh';
    fadeOverlay.style.background = 'black';
    fadeOverlay.style.opacity = 0;
    fadeOverlay.style.pointerEvents = 'none';
    fadeOverlay.style.zIndex = 9999;
    fadeOverlay.style.transition = 'opacity 0.5s linear';
    document.body.appendChild(fadeOverlay);
    window.fadeOverlay = fadeOverlay;

    // --- LIGHTS ---
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMappingExposure = 0.95;

    const ambientLight = new THREE.HemisphereLight(0xf2f6ff, 0x080820, 0.6);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffd2a1, 2.0);
    sun.position.set(50, 40, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 150;
    const d = 40;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    scene.add(sun);

    // --- SKY ---
    const sky = new Sky();
    sky.scale.setScalar(1000); 
    scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 1.2;
    skyUniforms['mieCoefficient'].value = 0.035;
    skyUniforms['mieDirectionalG'].value = 0.9;
    const sunPosition = new THREE.Vector3();
    sunPosition.copy(sun.position).normalize();
    skyUniforms['sunPosition'].value.copy(sunPosition);

    // --- 3. LOAD ASSETS ---
    const assets = await AssetLoader.loadAll();
    assets.wallE.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.wallEKey.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.boat.scene.traverse(obj => {
        if (obj.isMesh) {
            // obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.roach.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.floor.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.receiveShadow = true;
        }
    });

    assets.plant.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.trashCube.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.trashPile.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.buildingHigh.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.buildingBrick.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.buildingStore.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.car.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.waterPump.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    assets.bra.scene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });


    // Mixers setup
    const mixers = {
        boat: assets.boat.animations.length > 0 ? new THREE.AnimationMixer(assets.boat.scene) : null,
        wallE: assets.wallE.animations.length > 0 ? new THREE.AnimationMixer(assets.wallE.scene) : null,
        wallEKey: assets.wallEKey.animations.length > 0 ? new THREE.AnimationMixer(assets.wallEKey.scene) : null // Added if needed
    };

    scene.add(assets.boat.scene);
    scene.add(assets.wallE.scene);

    // --- 4. INIT SCENE MANAGER ---
    const context = {
        scene,
        camera,
        renderer,
        models: assets,
        mixers: mixers,
        controls: controls
    };

    const manager = new SceneManager(context);
    
    manager.setScenes([
        Scene1,
        Scene2,
        Scene3,  
        Scene4,
        Scene5,
        Scene6,
        Scene7,
        Scene8,
        Scene9
    ]);

    // --- 5. TOGGLE LOGIC (FREE ROAM) ---
    let isFreeRoam = false;

    window.addEventListener('keydown', (e) => {
        if (e.key === 'f' || e.key === 'F') {
            isFreeRoam = !isFreeRoam;

            if (isFreeRoam) {
                controls.enabled = true;
                debugDiv.style.display = 'block';
                
                manager.togglePause(true); 
                
                Object.values(mixers).forEach(m => m && (m.timeScale = 0));

                const vector = new THREE.Vector3(0, 0, -1);
                vector.applyQuaternion(camera.quaternion);
                controls.target.copy(camera.position).add(vector.multiplyScalar(10)); 

            } else {
                controls.enabled = false;
                debugDiv.style.display = 'none';

                manager.togglePause(false);

                Object.values(mixers).forEach(m => m && (m.timeScale = 1));
            }
        }
    });


    // --- 6. START LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();

        if (isFreeRoam) {
            controls.update();

            const cx = camera.position.x.toFixed(2);
            const cy = camera.position.y.toFixed(2);
            const cz = camera.position.z.toFixed(2);
            const tx = controls.target.x.toFixed(2);
            const ty = controls.target.y.toFixed(2);
            const tz = controls.target.z.toFixed(2);

            debugDiv.innerHTML = `
                <span style="color:white"><strong>[FREE ROAM ON]</strong> (Press F to exit)</span><br>
                <strong>Cam Pos:</strong> ${cx}, ${cy}, ${cz}<br>
                <strong>LookAt:</strong> ${tx}, ${ty}, ${tz}
            `;
        }
        manager.update(delta);

        Object.values(mixers).forEach(mixer => {
            if (mixer) mixer.update(delta);
        });

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