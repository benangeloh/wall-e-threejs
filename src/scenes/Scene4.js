import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { models, camera, scene, mixers } = context;

        const wallE = models.wallE.scene;
        const boat = models.boat.scene;
        const roach = models.roach.scene;
        const trashPile = models.trashPile.scene;

        // ============================================================
        // 0. SCENE SETUP
        // ============================================================

        boat.visible = false;
        roach.visible = false;

        trashPile.visible = true;
        trashPile.scale.set(1, 1, 1); 
        trashPile.position.set(54, 0, -7.5);
        trashPile.rotation.set(0, 3.5, 0);
        scene.add(trashPile);

        scene.add(wallE);
        
        wallE.position.set(6.0, 0, -2); 
        wallE.rotation.set(0, 1.7, 0); 

        camera.position.set(7.7, 4.2, -4.2); 
        
        this.cameraTarget = new THREE.Vector3(15, 2.1, 1);
        camera.lookAt(this.cameraTarget);

        // ============================================================
        // 1. GET PARTS
        // ============================================================
        
        const leftArm = wallE.getObjectByName("hand_low001_wall_e_0");
        const rightArm = wallE.getObjectByName("hand_low002_wall_e_0");

        if (mixers.wallE) mixers.wallE.stopAllAction();

        this.initialPose = {
            leftArm: {
                position: leftArm ? leftArm.position.clone() : null,
                rotation: leftArm ? leftArm.rotation.clone() : null
            },
            rightArm: {
                position: rightArm ? rightArm.position.clone() : null,
                rotation: rightArm ? rightArm.rotation.clone() : null
            }
        };


        // ============================================================
        // 2. CREATE SMOKE FX (SPRITES)
        // ============================================================
        
        const textureLoader = new THREE.TextureLoader();
        const smokeMap = textureLoader.load('img/smoke.png');

        const createSmoke = (count) => {
            const group = new THREE.Group();
            const material = new THREE.SpriteMaterial({ 
                map: smokeMap, 
                color: 0x8b7d6b, 
                transparent: true, 
                opacity: 0.3, 
                depthWrite: false 
            });
            
            const particles = [];
            for(let i=0; i<count; i++) {
                const sprite = new THREE.Sprite(material);
                sprite.position.set(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.2, 
                    (Math.random() - 0.5) * 0.5
                );
                sprite.material.rotation = Math.random() * Math.PI;
                sprite.scale.set(0.1, 0.1, 0.1); 
                group.add(sprite);
                particles.push(sprite);
            }
            return { group, particles, material };
        };

        const dust = createSmoke(12); 
        dust.group.visible = false; 
        wallE.add(dust.group);
        dust.group.position.set(0, 2, 3.2); 

        this.dustGroup = dust.group;

        // ============================================================
        // 3. TIMELINE
        // ============================================================

        const tl = gsap.timeline();

        // SETUP POSE
        if (leftArm) { 
            leftArm.rotation.set(-0.6, 0, 0); 
            leftArm.position.set(-0.3, 0, 1.4); 
        }
        if (rightArm) { 
            rightArm.rotation.set(2.4, 0, 0);
            rightArm.position.y=0;
            rightArm.position.z=1;
        }

        // STEP 1: REACH IN (0.0 - 0.8s)
        tl.to(rightArm.position, {
            z: 1, 
            duration: 0.2,
            ease: "back.inOut"
        });
        
        tl.to(leftArm.position, {
            z: 1.4,
            duration: 0.2,
            ease: "back.inOut"
        }, "<");


        // STEP 1.5: FWD
        tl.to([rightArm.position], {
            y: "-=2.4", 
            duration: 0.6,
            ease: "back.inOut"
        });

        tl.to([leftArm.position], {
            y: "-=2.3", 
            duration: 0.6,
            ease: "back.inOut"
        }, "<");

        tl.to([rightArm.rotation], {
            y: "+=0.2", 
            duration: 0.6,
            ease: "back.inOut"
        });
        tl.to([leftArm.rotation], {
            y: "+=0.2", 
            duration: 0.6,
            ease: "back.inOut"
        }, "<");


        // DIG DOWN + SMOKE PUFF (1.1s - 1.5s)
        
        tl.addLabel("impact");

        // ARMS SLAM
        tl.to([leftArm.position, rightArm.position], {
            duration: 0.2, 
            ease: "power4.in" 
        }, "impact");

        tl.to([leftArm.rotation, rightArm.rotation], {
            x: "+=0.5", 
            duration: 0.2,
            ease: "power4.in"
        }, "impact");

        // CAMERA SHAKE + FOCUS
        tl.to(camera.position, {
            y: "-=0.05",
            x: "+=0.05",
            duration: 0.1,
            yoyo: true,
            repeat: 3,
            ease: "rough"
        }, ">-0.1"); 


        // DUST
        tl.call(() => { dust.group.visible = true; }, null, ">-0.1");

        tl.to(dust.particles.map(p => p.scale), {
            x: 2.5, 
            y: 2.5,
            duration: 1.2,
            ease: "power2.out"
        }, ">-0.1");

        tl.to(dust.particles.map(p => p.position), {
            x: (i) => (Math.random() - 0.5) * 3.5, 
            y: (i) => Math.random() * 1.5 + 0.5, 
            z: (i) => (Math.random() - 0.5) * 1.5, 
            duration: 1.5,
            ease: "power2.out"
        }, "<");

        tl.to(dust.material, {
            opacity: 0,
            duration: 1.0,
            ease: "power2.in"
        }, ">-1.0"); 

        tl.call(onSceneComplete, null, "-=0.5");

        tl.to(this.cameraTarget, {
            y: -0.1,
            duration: 0.7,
            ease: "power2.out"
        }, "impact");

        this.timeline = tl;
    },

    update(delta, context) {
        if (this.cameraTarget) {
            context.camera.lookAt(this.cameraTarget);
        }
    },

    end(context) {
        if (this.timeline) this.timeline.kill();
        this.cameraTarget = null;

        if (this.dustGroup) {
            this.dustGroup.removeFromParent();
            this.dustGroup = null;
        }

        if (this.initialPose) {
            const { leftArm, rightArm } = this.initialPose;

            if (leftArm && leftArm.position) {
                const la = context.models.wallE.scene.getObjectByName("hand_low001_wall_e_0");
                la.position.copy(leftArm.position);
                la.rotation.copy(leftArm.rotation);
            }

            if (rightArm && rightArm.position) {
                const ra = context.models.wallE.scene.getObjectByName("hand_low002_wall_e_0");
                ra.position.copy(rightArm.position);
                ra.rotation.copy(rightArm.rotation);
            }

            this.initialPose = null;
        }

    }
};