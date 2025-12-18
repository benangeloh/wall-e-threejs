import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { models, camera, scene, mixers } = context;

        const wallE = models.wallE.scene;
        const boat = models.boat.scene;
        const roach = models.roach.scene;

        // ============================================================
        // 0. INITIAL SETUP
        // ============================================================

        const desertColor = 0xcc8e5a; 
        scene.background = new THREE.Color(desertColor);
        scene.fog = null; 

        // if (!this.sceneLight) {
        //     this.sceneLight = new THREE.HemisphereLight(0xffaa00, 0x444444, 1.2);
        //     scene.add(this.sceneLight);
        //     this.sceneSun = new THREE.DirectionalLight(0xffffff, 2.0);
        //     this.sceneSun.position.set(50, 100, 50);
        //     scene.add(this.sceneSun);
        // }

        if (models.floor) {
            const floorModel = models.floor.scene;
            floorModel.visible = true;
            
            this.floorGroup = new THREE.Group();
            scene.add(this.floorGroup);

            const tileSize = 10; 
            for (let x = -5; x <= 5; x++) {
                for (let z = -10; z <= 5; z++) {
                    const tile = floorModel.clone();
                    tile.position.set(x * tileSize, -0.5, z * tileSize);
                    
                    const randomRot = Math.floor(Math.random() * 4) * (Math.PI / 2);
                    tile.rotation.set(0, randomRot, 0);
                    
                    this.floorGroup.add(tile);
                }
            }
        }

        if (models.waterPump) {
            const pump = models.waterPump.scene;
            pump.visible = true;
            pump.position.set(-30, 0, -100); 
            pump.scale.set(1, 1.4, 1); 
            pump.rotation.set(0, -1.5, 0);
            pump.traverse(o => o.frustumCulled = false);
            scene.add(pump);
        }

        if (models.car) {
            const car = models.car.scene;
            car.visible = true;
            car.position.set(-20, 1, 10); 
            car.scale.set(7.5, 7.5, 7.5); 
            car.rotation.set(0, 0, 0);
            car.traverse(o => o.frustumCulled = false);
            scene.add(car);
        }

        if (models.glass) {
            const glass = models.glass.scene;
            glass.visible = true;
            glass.position.set(-17.5, 1.5, 12.4); 
            glass.scale.set(2, 2, 2); 
            glass.rotation.set(0.5, -1.5, 1);
            glass.traverse(o => o.frustumCulled = false);
            scene.add(glass);
        }


        // camera.position.set(5, 6, 14);
        // camera.lookAt(-4, 6, 1);
        camera.position.set(5, 6, 14);
        camera.lookAt(-4, 6, 1);


        boat.scale.set(1.5, 1.5, 1.5); 
        boat.position.set(0, -2.2, -19);
        boat.visible = true;
        scene.add(boat);

        // --- WALL-E GLOBAL POSITION ---
        wallE.position.set(-0.2, 3.5, 3.6); 
        wallE.rotation.set(0, 0, 0);
        scene.add(wallE);

        // --- ROACH POSITION ---
        roach.scale.set(1, 1, 1);
        roach.position.set(-1.6, 3.5, 7.0);
        roach.rotation.set(-0, 2.7, 0);
        roach.visible = true;
        scene.add(roach);

        // ============================================================
        // 1. ACCUMULATED  TRANSFORMS
        // ============================================================
        
        const neck = wallE.getObjectByName("neck_low_wall_e_0");
        const eyes = wallE.getObjectByName("eyes_low_wall_e_0");
        const lenses = wallE.getObjectByName("eyes_low001_eyes_0");
        const leftArm = wallE.getObjectByName("hand_low001_wall_e_0");
        const rightArm = wallE.getObjectByName("hand_low002_wall_e_0");
        const base = wallE.getObjectByName("base_low_wall_e_0");
        
        const body = [
            wallE.getObjectByName("back_low_wall_e_0"),
            wallE.getObjectByName("body_low_wall_e_0"),
        ].filter(Boolean);

        const wheels = [
            wallE.getObjectByName("trackGears1_low_wall_e_0"),
            wallE.getObjectByName("trackGears2_low_wall_e_0"),
            wallE.getObjectByName("trackGears3_low_wall_e_0"),
            wallE.getObjectByName("trackGears4_low_wall_e_0"),
        ].filter(Boolean);

        // --- A. BODY & BASE ---
        if (base) base.position.z = 0.02;

        body.forEach(b => {
            b.position.z = -0.25;
            b.position.y = -0.55;
            b.rotation.x = 1.55;
        });

        // --- B. NECK ---
        if (neck) {
            neck.position.z = -0.95;
            neck.position.y = -2.25;
            neck.rotation.x = 1.25;
        }

        // --- C. EYES & LENSES ---
        if (eyes) {
            eyes.position.z = -1.25;
            eyes.position.y = -3.25;
        }
        if (lenses) {
            lenses.position.z = -1.4; // (0.9 - 2.3)
            lenses.position.y = -3.35; // (0.15 - 3.5)
        }
        if (eyes) {
            eyes.rotation.x = 0.45;
            eyes.rotation.z = -0.05;
        }
        if (lenses) {
            lenses.rotation.x = 0.45;
            lenses.rotation.z = -0.05;
        }

        // --- D. ARMS ---
        // Right Arm 
        if (rightArm) {
            rightArm.rotation.set(3,-1.2,-0.9);
            rightArm.position.z = 0.2;
            rightArm.position.y = -2.3;
            rightArm.position.x = -2.5;
        }

        // Left Arm
        if (leftArm) {
            leftArm.rotation.set(-0.7, -0.9, -1.2);
            leftArm.position.z = -0.3;
            leftArm.position.y = -1.5;
        }
        // ============================================================
        // 2. STATE & ANIMATION LOOP
        // ============================================================
        
        this.state = {
            wheels,
            roach,
            wheelSpin: 0,
            trackActions: []
        };

        const wallEMixer = mixers.wallE;
        if (wallEMixer && models.wallE.animations.length > 0) {
            models.wallE.animations.forEach(clip => {
                const action = wallEMixer.clipAction(clip);
                action.play();
                action.timeScale = 0; 
                this.state.trackActions.push(action);
            });
        }

        // ============================================================
        // 3. NEW TIMELINE
        // ============================================================

        const tl = gsap.timeline({
            onComplete: onSceneComplete
        });

        tl.to(wallE.position, {
            z: "+=1.2",
            duration: 0.9,
            ease: "power2.out",
            onStart: () => {
                gsap.to(this.state, { 
                    wheelSpin: 4,  
                    duration: 0.2,
                    ease: "power2.out",
                });
            },
            onComplete: () => {
                gsap.to(this.state, { 
                    wheelSpin: 0, 
                    duration: 0.6,
                    ease: "power2.out",
                });
            }
        });

        tl.to([rightArm?.rotation].filter(Boolean), {
            x: "-=0.1",
            y: "+=1.3",
            z: "+=0.8",
            duration: 0.8,
            ease: "back.out"
        }, "<");

        tl.to([rightArm?.position].filter(Boolean), {
            x: "-=0.5",
            y: "+=1.8",
            z: "+=0.2",
            duration: 0.8,
            ease: "back.out"
        },"<");
        
        
        tl.to([leftArm?.position].filter(Boolean), {
            x: "-=0.1",
            y: "+=1.3",
            z: "+=0.8",
            duration: 0.9,
            ease: "back.out"
        }, "<");
        tl.to([leftArm?.rotation].filter(Boolean), {
            x: "+=0.3",
            y: "+=0.5",
            z: "+=0.8",
            duration: 0.9,
            ease: "back.out"
        }, "<");
                
        tl.to([ 
            ...body.map(b => b.position),
        ], { z: "+=0.5",y: "+=0.35", duration: 0.9, ease: "back.out" }, "<");

        tl.to([ 
            neck.position,
        ], { y: "+=2.25", z:"+=1.0", duration: 0.9, ease: "back.out" }, "<");

        tl.to([ 
            eyes.position,
        ], { y: "+=2.55", z:"+=1.8", duration: 0.9, ease: "back.out" }, "<");
        tl.to([ 
            lenses.position,
        ], { y: "+=2.8", z:"+=1.8", duration: 0.9, ease: "back.out" }, "<");

        tl.to([ 
            ...body.map(b => b.rotation),
        ], { x: "-=1.35", duration: 0.9, ease: "back.out" }, "<");

        tl.to([ 
            neck.rotation,
        ], { x: "-=1.25", duration: 0.9, ease: "back.out" }, "<");

        tl.to([ 
            eyes.rotation,
        ], { x: "+=0.25", duration: 0.9, ease: "back.out" }, "<");

        tl.to([ 
            lenses.rotation,
        ], { x: "+=0.25", duration: 0.9, ease: "back.out" }, "<");


        // Point

        tl.to([ 
            ...body.map(b => b.position), base.position
        ], { z: "+=0.05",y: "+=0.15", duration: 0.5, ease: "back.inOut" });

        tl.to([ 
            neck.position,
        ], { y: "+=0.25", z:"+=0.1", duration: 0.5, ease: "back.inOut" }, "<");

        tl.to([ 
            eyes.position,
        ], { y: "+=0.25", z:"+=0.1", duration: 0.5, ease: "back.inOut" }, "<");
        tl.to([ 
            lenses.position,
        ], { y: "+=0.2", z:"-=0.0", duration: 0.5, ease: "back.inOut" }, "<");

        tl.to([ 
            ...body.map(b => b.rotation), base.rotation
        ], { x: 0, duration: 0.5, ease: "back.inOut" }, "<");

        tl.to([rightArm?.rotation].filter(Boolean), {
            x: "-=0.1",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");

        tl.to([rightArm?.position].filter(Boolean), {
            z: "+=0.1",
            y: "+=0.5",
            duration: 0.5,
            ease: "back.inOut"
        },"<");

        tl.to([leftArm?.rotation].filter(Boolean), {
            x: "-=2.1",
            y: "-=2.8",
            z: "-=0.6",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");

        tl.to([leftArm?.position].filter(Boolean), {
            x: "-=0.5",
            y: "+=0.2",
            z: "-=0.1",
            duration: 0.5,
            ease: "back.inOut"
        },"<");


        //  roach goes back to where it came from

        const roachCurveReverse = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-1.6, 3.5, 7.0),
            new THREE.Vector3(-0.7, 3.5, 6.8),
            new THREE.Vector3(0.5, 3.5, 6.2),
            new THREE.Vector3(3, 3.5, 6),
            new THREE.Vector3(6, 3.5, 4),
        ], false);

        const roachMotion = { t: 0 };

        tl.to(roachMotion, {
            t: 1,
            duration: 0.8,
            ease: "none",

            onStart: () => {
                roach.visible = true;

                if (this.roachMixer) {
                    const action = this.roachMixer.clipAction(models.roach.animations[0]);
                    action.enabled = true;
                    action.reset().play();
                    this.roachMixer.timeScale = 1.3;
                }
            },

            onUpdate: () => {
                const p = roachCurveReverse.getPoint(roachMotion.t);
                const dir = roachCurveReverse.getTangent(roachMotion.t);

                roach.position.copy(p);

                roach.rotation.y = Math.atan2(dir.x, dir.z);
            },

            onComplete: () => {
                if (this.roachMixer) {
                    gsap.to(this.roachMixer, {
                        timeScale: 0,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                }
            }
        });

        tl.to([eyes.rotation, lenses.rotation], {
            z: "+=1",
            y: "+=0.3",
            duration: 1.6,
            ease: "power2.inOut"
        }, "<");

        tl.to([lenses.position], {
            x: "+=0.2",
            z: "-=0.1",
            y: "+=0.4",
            duration: 1.6,
            ease: "power2.inOut"
        }, "<");

        tl.to([wallE.rotation], {
            y: "+=0.3",
            duration: 1,
            ease: "power2.inOut"
        }, "-=1.4");

        
        tl.to([wallE.position], {
            z: "-=0.3",
            duration: 1,
            ease: "power2.inOut",
            onStart: () => gsap.to(this.state, { wheelSpin: -5, duration: 0.5, ease:"power2.in" }), 
            onComplete: () => gsap.to(this.state, { wheelSpin: 0, duration: 0.5, ease:"power2.out" })
        }, "<");
    
        // points down

        tl.to([leftArm?.rotation].filter(Boolean), {
            x: "+=0.4",
            duration: 0.4,
            ease: "back.in"
        }, "-=1");

        tl.to([leftArm?.rotation].filter(Boolean), {
            x: "-=0.5",
            z: "-=0.3",
            duration: 0.3,
            ease: "back.out"
        }, "-=0.4");


        // ============================================================
        // 4. RETURN TO INITIAL POSITION (RESET)
        // ============================================================

        tl.to({}, { duration: 0.5 });

        // --- A. GLOBAL POSITION RESET ---
        tl.to(wallE.position, {
            x: 0,
            y: 3.5,
            z: 5, 
            duration: 1.0,
            ease: "back.inOut",
            onStart: () => {
                // neg spin because he is driving backwards to z=0
                gsap.to(this.state, { wheelSpin: -12, duration: 0.5, ease: "power1.in" });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.5, ease: "power1.out" });
            }
        }, "-=0.4");

        tl.to(wallE.rotation, {
            x: 0, y: 0, z: 0,
            duration: 1.0,
            ease: "back.inOut"
        }, "<");


        // --- B. BODY & HEAD RESET ---
        tl.to([
            ...body.map(b => b.position),
            neck.position,
            eyes.position,
            lenses.position,
            base.position
        ], { x: 0, y: 0, z: 0, duration: 1.0, ease: "back.inOut" }, "<");

        tl.to([
            ...body.map(b => b.rotation),
            neck.rotation,
            eyes.rotation,
            lenses.rotation,
            base.rotation
        ], { x: 0, y: 0, z: 0, duration: 1.0, ease: "back.inOut" }, "<");

        if (rightArm) {
            tl.to(rightArm.rotation, { 
                x: 2.7, y: 0, z: 0, 
                duration: 1.0, ease: "back.inOut" 
            }, "<");
            
            tl.to(rightArm.position, { 
                x: "-=0", y:"+=0.2", z: "-=0.5",
                duration: 1.0, ease: "back.inOut" 
            }, "<");
        }

        if (leftArm) {
            tl.to(leftArm.rotation, { 
                x: -0.5, y: 0, z: 0, 
                duration: 1.0, ease: "back.inOut" 
            }, "<");
            
            tl.to(leftArm.position, { 
                x: 0, y: 0.4, z: 0, 
                duration: 1.0, ease: "back.inOut" 
            }, "<");
        }

        // ============================================================
        //  EXIT TIMELINE
        // ============================================================

        // to edge of ramp
        tl.to(wallE.position, {
            z: 11,
            duration: 0.6,
            ease: "power1.in",
            onStart: () => gsap.to(this.state, { wheelSpin: 10, duration: 0.5 })
        });


        // down the ramp
        tl.to(wallE.position, {
            z: "+=11",
            y: 3,
            duration: 1,
            ease: "none"
        });

        tl.to(wallE.rotation, {
            x: 0.2,
            duration: 0.2,
            ease: "power1.inOut"
        }, "<");

        tl.to(camera.position, {
            z: 16,
            // x: "-=1.3",
            duration: 1,
            ease: "none"
        },"<");

        tl.to(camera.rotation, {
            y: "+=0.3",
            x: "-=0.3",
            z: "+=0.3",
            duration: 1.6,
            ease: "power2.inOut"
        },"<");


        // --- ROACH RETURNS ---
        const roachReturnCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(6, 3.5, 2),
            new THREE.Vector3(3.5, 3.5, 3.0),
            new THREE.Vector3(2.5, 3.5, 5.0)
        ]);
        
        const returnMotion = { t: 0 };

        tl.to(returnMotion, {
            t: 1,
            duration: 1.6,
            ease: "power2.inOut",
            onStart: () => {
                if (this.roachMixer) gsap.to(this.roachMixer, { timeScale: 2.0, duration: 0.2 });
            },
            onUpdate: () => {
                const p = roachReturnCurve.getPoint(returnMotion.t);
                const dir = roachReturnCurve.getTangent(returnMotion.t);
                roach.position.copy(p);
                roach.rotation.y = Math.atan2(dir.x, dir.z);
            },
            onComplete: () => {
                 if (this.roachMixer) gsap.to(this.roachMixer, { timeScale: 0, duration: 0.2 });
                 gsap.to(roach.rotation, { y: 0, duration: 0.3 });
            }
        }, "-=3.9");


        // --- ROACH JUMP ---
        // roach follows + hops
        tl.to(roach.position, { z: 7, duration: 0.6, ease: "power1.in" }, "-=1.4");
        tl.to(roach.position, { y: 4.5, duration: 0.3, ease: "power1.out", yoyo: true, repeat: 1 }, "-=1.4");

        const roachZigzagCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(2.5, 3.5, 7),
            new THREE.Vector3(1.5, 3.5, 8),
            new THREE.Vector3(0.5, 3.5, 9),
            new THREE.Vector3(0, 3.5, 10),
            new THREE.Vector3(0.5, 3.5, 11),
            new THREE.Vector3(1.0, 3.4, 12),
            new THREE.Vector3(0.5, 3.3, 13),
            new THREE.Vector3(1.0, 3.2, 14),
            new THREE.Vector3(0.5, 3.1, 15),
            new THREE.Vector3(1.0, 3.0, 16),
        ], false);
        
        const zigzagMotion = { t: 0 };
        tl.to(zigzagMotion, {
            t: 1, duration: 1.4, ease: "none",
            onStart: () => { if(this.roachMixer) gsap.to(this.roachMixer, { timeScale: 2.5, duration: 0.1 }); },
            onUpdate: () => {
                const p = roachZigzagCurve.getPoint(zigzagMotion.t);
                const dir = roachZigzagCurve.getTangent(zigzagMotion.t);
                roach.position.copy(p);
                roach.rotation.y = Math.atan2(dir.x, dir.z);
            }
        }, "-=0.4");

        tl.to({}, { duration: 0.7 });
        
        this.timeline = tl;
    },

    update(delta, context) {
        if (!this.state) return;

        const { wheels, roach, wheelSpin, trackActions } = this.state;

        if (trackActions) {
            trackActions.forEach(action => {
                action.timeScale = wheelSpin * 0.1; 
            });
        }

        wheels.forEach(w => {
            if (w) w.rotation.x += wheelSpin * delta;
        });
    },

    end(context) {
        gsap.killTweensOf(this.state);
        gsap.killTweensOf(context.camera.position);
        gsap.killTweensOf(context.camera.rotation);
        if (context.mixers.wallE) {
            context.mixers.wallE.stopAllAction();
        }
        if (this.timeline) this.timeline.kill();
        this.state = null;
    }
};