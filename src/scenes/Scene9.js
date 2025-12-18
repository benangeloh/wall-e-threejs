import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { models, camera, scene, mixers } = context;

        // ============================================================
        // 0. CLEANUP
        // ============================================================

        if(models.trashPile) models.trashPile.scene.visible = false; 
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

        wallE.position.set(0, -0.9, -2);
        wallE.rotation.set(0, 0, 0);
 
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

        // rightArm.rotation.set(3.2, 0.2, 0.1);
        rightArm.rotation.set(-0, 0.2, 0.1);
        rightArm.position.set(-3, -0.4, -0.3);

        leftArm.rotation.set(0, 0.2, 0.1);
        leftArm.position.set(-0, 0.2, -0.0);

        neck.position.set(0, -0.1, -0.1);
        neck.rotation.x = 0.2;

        eyes.position.set(-0.1, -0.4, 0.05);
        lenses.position.set(-0.1, -0.4, -0.0);
        eyes.rotation.set(-0.4, 0, 0.1);
        lenses.rotation.set(-0.4, 0, 0.1);

        this.leanGroup = new THREE.Group();
        wallE.add(this.leanGroup);

        [...bodyParts, neck, eyes, lenses, leftArm, rightArm, base]
            .filter(Boolean)
            .forEach(p => this.leanGroup.attach(p));

        const plant = models.plant.scene;
        plant.visible = true;

        plant.position.set(
            -0.7,
            1.0,
            8.7
        );

        plant.scale.setScalar(2.5);
        plant.rotation.set(0,0,0);
        scene.add(plant);


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

        // camera.position.set(12.5, 5.4, 12.9);
        // camera.lookAt(-1.25, 1.55, 2);

        camera.position.set(0.4, 3.68, 6.12);
        camera.lookAt(-1.39, 5.92, 1.58);

        // ============================================================
        // 7. TIMELINE
        // ============================================================
        const tl = gsap.timeline({ onComplete: onSceneComplete });

        tl.to(wallE.position, {
            z: "+=5.5", 
            y: "+=1.8",
            duration: 4,
            ease: "power1.inOut",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: 2, duration: 0.3 });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.1 });
            }
        });

        tl.to([eyes.rotation, lenses.rotation], {
            x: "+=0.3",
            z: "+=0.1",
            duration: 0.8,
            ease: "power3.out",
        }, "-=2.1")

        tl.to([eyes.rotation, lenses.rotation], {
            x: "+=0.3",
            z: "-=0.1",
            duration: 0.8,
            ease: "power3.out",
        }, "-=1.1")

        tl.to([eyes.position, lenses.position], {
            y: "-=0.05",
            // z: "-=0.1",
            duration: 0.2,
            ease: "power1.in",
        }, "-=0.6")

        tl.to([eyes.position, lenses.position], {
            y: "+=0.05",
            z: "-=0.1",
            duration: 0.4,
            ease: "power2.out",
        }, "-=0.3")


        tl.to(camera.position, {
            z: "+=3.7",     // pull back
            y: "-=2.2",     // lower slightly
            duration: 4,
            ease: "power1.inOut",
        });

        tl.to([eyes.position], {
            y: "-=0.05",
            duration: 0.8,
            ease: "power3.in",
        }, "<")

        tl.to(neck.position, {
            y: "-=0.05",
            duration: 0.8,
            ease: "power3.in",
        }, "<")

        tl.to(this.leanGroup.rotation, {
            x: "+=0.7",
            duration: 3.4,
            ease: "power4.inOut"
        }, "<"); 

        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.5",
            y: "+=0.2",
            duration: 3.4,
            ease: "power4.inOut"
        }, "<")

        tl.to(neck.rotation, {
            x: "-=0.1",
            duration: 3.4,
            ease: "power4.inOut"
        }, "<")

        tl.to([eyes.rotation, lenses.rotation], {
            y: "-=0.4",
            duration: 3.4,
            ease: "power4.inOut"
        }, "-=1.8")

        tl.to([eyes.position, lenses.position], {
            x: "-=0.1",
            duration: 3.4,
            ease: "power4.inOut"
        }, "<")

        tl.to(neck.rotation, {
            y: "-=0.1",
            duration: 3.4,
            ease: "power4.inOut"
        }, "<")

        tl.to({}, {
            duration: 5.0,
            onStart: () => {
                window.fadeOverlay.style.transition = 'opacity 2s ease-in-out';
                window.fadeOverlay.style.opacity = 1;
            }
        });

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
