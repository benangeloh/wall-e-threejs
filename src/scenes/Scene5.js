import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { models, camera, scene, mixers } = context;

        // ============================================================
        // 0. CLEANUP PREVIOUS SCENE
        // ============================================================
        models.boat.scene.visible = false;
        models.wallE.scene.visible = false;
        models.roach.scene.visible = false;
        if(models.trashPile) models.trashPile.scene.visible = false;

        if (mixers.wallE) mixers.wallE.stopAllAction();

        // ============================================================
        // 1. SETUP ENVIRONMENT
        // ============================================================
        
        const floorScene = models.floor.scene;
        const floorMesh = floorScene.getObjectByName("Object_2");
        
        if (floorMesh) {
            floorScene.visible = true;
            floorScene.position.set(0, 0, 0);
            floorScene.scale.set(3, 3, 3); 
            scene.add(floorScene);
        }

        const sourceCubeNode = models.trashCube.scene.getObjectByName("Scrap_0");
        if (!sourceCubeNode) return;

        const cubeGeo = sourceCubeNode.geometry;
        const cubeMat = sourceCubeNode.material;

        this.cubeGroup = new THREE.Group();
        scene.add(this.cubeGroup);

        const CUBE_SIZE = 1.3; 
        const SPACING =2; 
        
        const CUBE_VARIANTS = {
            normal: {
                rot: [0, 0, 0],
                posOffset: [0, 0, 0]
            },
            tiltedLow: {
                rot: [1.5, 0, 0],
                posOffset: [0, 1, -0.4]
            },
            tiltedHigh: {
                rot: [3.2, 0, 0],
                posOffset: [0, 2, -0.4]
            }
        };

        const TOP_ROW_Z_OFFSET = -0.8;
        const BACK_ROW_Z_OFFSET = -4.0;
        const FALL_START_Y = 10;
        const FALL_START_Z = 2.5;
        const FALL_END_Z = 0;

        // ============================================================
        // 2. BUILD THE PILE
        // ============================================================
        const spawnCube = (x, y, z, variant = CUBE_VARIANTS.normal) => {
            const mesh = new THREE.Mesh(cubeGeo, cubeMat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.rotation.set(
                variant.rot[0],
                variant.rot[1],
                variant.rot[2]
            );

            mesh.position.set(
                x + variant.posOffset[0],
                y + variant.posOffset[1],
                z + variant.posOffset[2]
            );

            this.cubeGroup.add(mesh);
            return mesh;
        };

        // --- BOTTOM ROW (10 Cubes) ---
        // Indices 0 to 9
        const bottomRowVariants = [
            'normal',
            'tiltedLow',
            'normal',
            'normal',
            'tiltedHigh',
            'normal',
            'tiltedLow',
            'normal',
            'tiltedLow',
            'tiltedHigh'
        ];


        for (let i = 0; i < 10; i++) {
            const variantKey = bottomRowVariants[i] || 'normal';
            spawnCube(
                i * SPACING,
                CUBE_SIZE / 2,
                0,
                CUBE_VARIANTS[variantKey]
            );
        }

        const backRowX = 9 * SPACING;

        spawnCube(
            backRowX,
            CUBE_SIZE / 2,
            BACK_ROW_Z_OFFSET,
            CUBE_VARIANTS.tiltedLow
        );

        spawnCube(
            backRowX,
            CUBE_SIZE / 2,
            BACK_ROW_Z_OFFSET,
            CUBE_VARIANTS.tiltedHigh
        );



        const topRowVariants = [
            'tiltedLow',
            'tiltedHigh'
        ];

        const topRowIndices = [6, 7];

        topRowIndices.forEach((baseIndex, i) => {
            const variantKey = topRowVariants[i] || 'normal';
            spawnCube(
                baseIndex * SPACING,
                CUBE_SIZE * 1.5,
                TOP_ROW_Z_OFFSET,
                CUBE_VARIANTS[variantKey]
            );
        });

        const targetX = 10 * SPACING;

        const fallingCube = spawnCube(
            targetX,
            FALL_START_Y,
            FALL_START_Z
        );

        fallingCube.rotation.set(-2, 0, 0);



        // ============================================================
        // 3. CAMERA SETUP
        // ============================================================
        
        camera.position.set(23, 2, 5.5);
        camera.lookAt(5, 3, -9);

        // ============================================================
        // 4. SMOKE FX SETUP
        // ============================================================
        const textureLoader = new THREE.TextureLoader();
        const smokeMap = textureLoader.load('img/smoke.png');
        
        const createSmoke = () => {
            const group = new THREE.Group();
            const material = new THREE.SpriteMaterial({ 
                map: smokeMap, color: 0x8b7d6b, transparent: true, opacity: 0.4, depthWrite: false 
            });
            const particles = [];
            for(let i=0; i<8; i++) {
                const sprite = new THREE.Sprite(material);
                sprite.position.set((Math.random()-0.5), 0, (Math.random()-0.5));
                sprite.scale.set(0.1, 0.1, 0.1); 
                group.add(sprite);
                particles.push(sprite);
            }
            return { group, particles, material };
        };

        const impactSmoke = createSmoke();
        impactSmoke.group.visible = false;
        impactSmoke.group.position.set(targetX, 0.5, 0); 
        scene.add(impactSmoke.group);


        // ============================================================
        // 5. TIMELINE
        // ============================================================

        const tl = gsap.timeline({
            onComplete: onSceneComplete
        });

        tl.to({}, { duration: 0.5 });

        // cube fall
        tl.to(fallingCube.position, {
            y: CUBE_SIZE / 2,
            z: FALL_END_Z,
            duration: 0.8,
            ease: "bounce.out"
        });

        tl.to(fallingCube.rotation, {
            x: 0, 
            z: 0, 
            duration: 0.8,
            ease: "bounce.out"
        }, "<");

        tl.call(() => { impactSmoke.group.visible = true; }, null, "-=0.65"); 

        tl.to(impactSmoke.particles.map(p => p.scale), {
            x: 3, y: 3, duration: 1.0, ease: "power2.out"
        }, "<");
        
        tl.to(impactSmoke.particles.map(p => p.position), {
            y: (i) => Math.random() * 2,
            x: (i) => (Math.random() - 0.5) * 3,
            duration: 1.0, ease: "power2.out"
        }, "<");

        tl.to(impactSmoke.material, { opacity: 0, duration: 0.8 }, "<0.2");

        tl.to(camera.position, {
            y: "-=0.1",
            duration: 0.1,
            yoyo: true,
            repeat: 1
        }, "-=0.65");

        this.timeline = tl;
    },

    update(delta, context) {},

    end(context) {
        if (this.timeline) this.timeline.kill();
        if (this.cubeGroup) {
            context.scene.remove(this.cubeGroup);
            this.cubeGroup = null;
        }
        if (context.models.floor) {
            context.scene.remove(context.models.floor.scene);        
        }
    }
};