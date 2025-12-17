import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { models, camera, scene, mixers } = context;

        // ============================================================
        // 0. CLEANUP
        // ============================================================
        Object.values(models).forEach(m => m?.scene && (m.scene.visible = false));
        if (mixers.wallE) mixers.wallE.stopAllAction();

        // ============================================================
        // 1. FLOOR
        // ============================================================
        const floor = models.floor.scene;
        floor.visible = true;
        floor.position.set(0, 0, 0);
        floor.scale.set(3, 3, 3);
        scene.add(floor);

        // ============================================================
        // 2. WALL-E SETUP
        // ============================================================
        const wallE = models.wallE.scene;
        wallE.visible = true;
        scene.add(wallE);

        wallE.position.set(9, 0.9, 20);
        wallE.rotation.set(0, 3.1, 0);

        const rightArm = wallE.getObjectByName("hand_low002_wall_e_0");
        const leftArm = wallE.getObjectByName("hand_low001_wall_e_0");
        const neck = wallE.getObjectByName("neck_low_wall_e_0");
        const eyes = wallE.getObjectByName("eyes_low_wall_e_0");
        const lenses = wallE.getObjectByName("eyes_low001_eyes_0");
        const base = wallE.getObjectByName("base_low_wall_e_0");

        const bodyParts = [
            wallE.getObjectByName("back_low_wall_e_0"),
            wallE.getObjectByName("body_low_wall_e_0"),
        ].filter(Boolean);

        const wheels = [
            wallE.getObjectByName("trackGears1_low_wall_e_0"),
            wallE.getObjectByName("trackGears2_low_wall_e_0"),
            wallE.getObjectByName("trackGears3_low_wall_e_0"),
            wallE.getObjectByName("trackGears4_low_wall_e_0"),
        ].filter(Boolean);

        rightArm.rotation.set(-0.7, 0.2, 0.1);
        rightArm.position.set(-2.8, -0.0, -0.3);

        leftArm.rotation.set(-0.6, 0.2, 0.1);
        leftArm.position.set(-0, 0.2, -0.0);

        neck.position.set(0, -0.1, -0.1);
        neck.rotation.x = 0.2;

        eyes.position.set(0, -0.8, 0.05);
        lenses.position.set(0, -0.8, -0.0);
        eyes.rotation.set(-0.1, 0, 0);
        lenses.rotation.set(-0.1, 0, 0);

        this.leanGroup = new THREE.Group();
        wallE.add(this.leanGroup);

        [...bodyParts, neck, eyes, lenses, leftArm, rightArm, base]
            .filter(Boolean)
            .forEach(p => this.leanGroup.attach(p));

        // ============================================================
        // 3. WALL-E ANIMATION STATE
        // ============================================================
        this.state = { wheels, wheelSpin: 0, trackActions: [] };

        if (mixers.wallE && models.wallE.animations.length) {
            models.wallE.animations.forEach(clip => {
                const action = mixers.wallE.clipAction(clip);
                action.play();
                action.timeScale = 0;
                this.state.trackActions.push(action);
            });
        }

        // ============================================================
        // 4. CUBE STACK
        // ============================================================
        const source = models.trashCube.scene.getObjectByName("Scrap_0");
        const geo = source.geometry;
        const mat = source.material;

        this.heroCube = new THREE.Mesh(geo, mat);
        this.heroCube.castShadow = true;
        this.heroCube.receiveShadow = true;
        this.heroCube.scale.setScalar(0.9);
        this.heroCube.position.set(9, 2.7, 17.4);
        this.heroCube.rotation.set(0.0, 0.0, 0);

        scene.add(this.heroCube);


        this.heroCube2 = new THREE.Mesh(geo, mat);
        this.heroCube2.castShadow = true;
        this.heroCube2.receiveShadow = true;
        this.heroCube2.scale.setScalar(0.9);
        this.heroCube2.position.set(10.8, 2.7, 17.4);
        this.heroCube2.rotation.set(0.0, 0.0, 0);

        scene.add(this.heroCube2);

        this.cubeGroup = new THREE.Group();
        scene.add(this.cubeGroup);

        const SIZE = 1.2;
        const SPACING = 1.8;
        const CUBE_SCALE = 0.9;

        const CUBE_VARIANTS = {
            normal: { rot: [0, 0, 0], posOffset: [0, 0, 0] },
            tiltedLow: { rot: [1.5, 0, 0], posOffset: [0, 0.8, -0.7] },
            tiltedHigh: { rot: [3.2, 0, 0], posOffset: [0, 1.6, 0.2] }
        };
        const variantKeys = Object.keys(CUBE_VARIANTS);

        const spawn = (x, y, z) => {
            const m = new THREE.Mesh(geo, mat);
            m.castShadow = m.receiveShadow = true;
            m.scale.setScalar(CUBE_SCALE);

            const randomKey = variantKeys[Math.floor(Math.random() * variantKeys.length)];
            const variant = CUBE_VARIANTS[randomKey];

            m.position.set(
                x + variant.posOffset[0],
                y + variant.posOffset[1],
                z + variant.posOffset[2]
            );

            m.rotation.set(
                variant.rot[0],
                variant.rot[1],
                variant.rot[2]
            );

            this.cubeGroup.add(m);
            return m;
        };

        // row - r1
        for (let i = 0; i < 10; i++) {
            spawn(i * SPACING, SIZE / 2, 0);
        }

        for (let i = 0; i < 10; i++) {
            spawn(i * SPACING, SIZE * 2, 0);
        }

        for (let i = 0; i < 5; i++) {
            spawn(i * SPACING, SIZE * 3.5, 0);
        }

        for (let i = 0; i < 5; i++) {
            spawn(i * SPACING, SIZE * 5, 0);
        }


        // row - r2
        for (let i = 0; i < 10; i++) {
            spawn(i * SPACING, SIZE / 2, 1.8);
        }

        for (let i = 0; i < 10; i++) {
            spawn(i * SPACING, SIZE * 2, 1.8);
        }

        for (let i = 0; i < 5; i++) {
            spawn(i * SPACING, SIZE * 3.5, 1.8);
        }

        for (let i = 0; i < 5; i++) {
            spawn(i * SPACING, SIZE * 5, 1.8);
        }


        // row -r3
        for (let i = 0; i < 10; i++) {
            spawn(i * SPACING, SIZE / 2, 3.6);
        }

        for (let i = 0; i < 10; i++) {
            spawn(i * SPACING, SIZE * 2, 3.6);
        }

        for (let i = 0; i < 5; i++) {
            spawn(i * SPACING, SIZE * 3.5, 3.6);
        }

        for (let i = 0; i < 5; i++) {
            spawn(i * SPACING, SIZE * 5, 3.6);
        }


        // row - l

        for (let i = 0; i < 10; i++) {
            spawn(0, SIZE / 2, i * SPACING);
        }

        for (let i = 0; i < 10; i++) {
            spawn(0, SIZE * 2, i * SPACING);
        }

        for (let i = 0; i < 10; i++) {
            spawn(0, SIZE * 3.5, i * SPACING);
        }

        // camera.position.set(12.5, 5.4, 12.9);
        // camera.lookAt(-1.25, 1.55, 2);

        camera.position.set(16.85, 6.41, 12.78);
        camera.lookAt(0, 0, 0);

        // ============================================================
        // 7. TIMELINE
        // ============================================================
        const tl = gsap.timeline({ onComplete: onSceneComplete });

        tl.to(wallE.position, {
            z: "-=11.5", 
            duration: 1.7,
            ease: "power3.out",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: 2, duration: 0.3 });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.1 });
            }
        });

        tl.to(this.heroCube.position, {
            z: "-=11.5",
            duration: 1.7,
            ease: "power3.out"
        }, "<");

        tl.to(this.leanGroup.position, {
            y: "+=1",
            duration: 0.8,
            ease: "back.inOut"
        }, "-=0.4");

        tl.to(this.heroCube.position, {
            y: "+=1.2",
            duration: 0.8,
            ease: "back.inOut"
        }, "<");

        tl.to([rightArm.rotation, leftArm.rotation], {
            x: "-=0.1",
            duration: 0.8,
            ease: "back.inOut"
        }, "<")


        tl.to(wallE.position, {
            z: "-=1", 
            duration: 1,
            ease: "power2.out",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: 2, duration: 0.3 });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.1 });
            }
        }, "-=0.4");

        tl.to([rightArm.position, leftArm.position], {
            z: "+=1.1",
            duration: 1,
            ease: "power2.out"
        }, "<")

        tl.to(this.heroCube.position, {
            z: "-=2.2",
            duration: 1,
            ease: "power2.out"
        }, "<");

        tl.to([rightArm.position, leftArm.position], {
            z: "-=1.1",
            duration: 0.5,
            ease: "power2.in"
        }, "-=0.4");

        tl.to(wallE.position, {
            z: "+=2", 
            x: "-=2", 
            duration: 1,
            ease: "power2.in",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: -8, duration: 0.5 });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.3 });
            }
        }, "<");

        tl.to(wallE.rotation, {
            y: "-=1", 
            duration: 1,
            ease: "power2.in",
        }, "<");

        tl.to([rightArm.rotation, leftArm.rotation], {
            x: "+=0.1",
            duration: 0.5,
            ease: "power2.in",
        }, "<")
        tl.to(this.leanGroup.position, {
            y: "-=1",
            duration: 1,
            ease: "power2.out",
        }, "<");

        tl.to(wallE.position, {
            z: "+=0.5", 
            x: "-=1", 
            duration: 0.5,
            ease: "power2.out",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: -8, duration: 0.5 });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.3 });
            }
        });

        tl.to(wallE.rotation, {
            y: "-=0.4", 
            duration: 1,
            ease: "power2.out",
        }, "<");


        tl.to([lenses.rotation, eyes.rotation], {
            z: "-=0.8",
            duration: 0.6,
            ease: "power2.inOut",
        }, "-=0.4");

        tl.to([lenses.rotation, eyes.rotation], {
            z: "+=0.2",
            duration: 0.4,
            ease: "power2.out",
        });

        tl.to(wallE.position, {
            x: "+=2", 
            z: "+=2", 
            duration: 0.6,
            ease: "power2.in",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: +8, duration: 0.5 });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.3 });
            }
        },"<");

        tl.to(wallE.rotation, {
            y: "-=0.6", 
            duration: 0.6,
            ease: "power2.in",
        }, "<");

        tl.to(wallE.position, {
            x: "+=1", 
            z: "+=5", 
            duration: 1,
            ease: "power2.out",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: +8, duration: 0.5 });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.3 });
            }
        });

        tl.to(wallE.rotation, {
            y: "-=0.6", 
            duration: 1,
            ease: "power2.out",
        }, "<");



        tl.to(wallE.position, {
            x: 10.8, z: 20, duration: 1.5, ease: "power2.inOut",
            onStart: () => gsap.to(this.state, { wheelSpin: 8, duration: 1.0 })
        });
        tl.to(wallE.rotation, { y: 3.1, duration: 1.5, ease: "power2.inOut" }, "<");
        tl.to([lenses.rotation, eyes.rotation], { z: "+=0.6", duration: 1.0 }, "<");

        tl.to(wallE.position, {
            z: "-=11.5", 
            duration: 1.7,
            ease: "power3.out",
            onStart: () => gsap.to(this.state, { wheelSpin: 2, duration: 0.3 }),
            onComplete: () => gsap.to(this.state, { wheelSpin: 0, duration: 0.1 })
        });
        tl.to(this.heroCube2.position, { z: "-=11.5", duration: 1.7, ease: "power3.out" }, "<");

        tl.to(this.leanGroup.position, { y: "+=1", duration: 0.8, ease: "back.inOut" }, "-=0.4");
        tl.to(this.heroCube2.position, { y: "+=1.2", duration: 0.8, ease: "back.inOut" }, "<");
        tl.to([rightArm.rotation, leftArm.rotation], { x: "-=0.1", duration: 0.8, ease: "back.inOut" }, "<");

        tl.to(wallE.position, {
            z: "-=1", duration: 1, ease: "power2.out",
            onStart: () => gsap.to(this.state, { wheelSpin: 2, duration: 0.3 }),
            onComplete: () => gsap.to(this.state, { wheelSpin: 0, duration: 0.1 })
        }, "-=0.4");
        tl.to([rightArm.position, leftArm.position], { z: "+=1.1", duration: 1, ease: "power2.out" }, "<");
        tl.to(this.heroCube2.position, { z: "-=2.2", duration: 1, ease: "power2.out" }, "<");


        this.timeline = tl;
    },

    update(delta) {
        if (!this.state) return;

        const { wheels, wheelSpin, trackActions } = this.state;

        trackActions.forEach(a => a.timeScale = wheelSpin * 0.1);
        wheels.forEach(w => w && (w.rotation.x += wheelSpin * delta));
    },

    end() {
        if (this.timeline) this.timeline.kill();
    }
};
