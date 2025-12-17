import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { models, camera, scene, mixers } = context;

        if(models.trashPile) models.trashPile.scene.visible = false;
        if(models.trashCube) models.trashCube.scene.visible = false;
        if(models.buildingBrick) models.buildingBrick.scene.visible = false;
        if(models.buildingHigh) models.buildingHigh.scene.visible = false;

        if (mixers.wallE) mixers.wallE.stopAllAction();

        const desertColor = 0xcc8e5a; 
        scene.background = new THREE.Color(desertColor);
        scene.fog = null; 

        if (!this.sceneLight) {
            this.sceneLight = new THREE.HemisphereLight(0xffaa00, 0x444444, 1.2);
            scene.add(this.sceneLight);
            this.sceneSun = new THREE.DirectionalLight(0xffffff, 2.0);
            this.sceneSun.position.set(50, 100, 50);
            scene.add(this.sceneSun);
        }

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

        const wallE = models.wallE.scene;
        const boat = models.boat.scene;
        const roach = models.roach.scene;

        // ============================================================
        // 0. INITIAL SETUP
        // ============================================================

        camera.position.set(5, 6, 14);
        camera.lookAt(-4, 6, 1);

        boat.scale.set(1.5, 1.5, 1.5); 
        boat.position.set(0, -2.2, -19);
        boat.visible = true;
        scene.add(boat);

        wallE.position.set(0, 3.5, 0);
        wallE.rotation.y = 0; 
        scene.add(wallE);

        roach.scale.set(1, 1, 1);
        roach.position.set(0, 3.2, -13);
        roach.rotation.y = -Math.PI / 2;
        roach.visible = false;
        scene.add(roach);

        const wheels = [
            wallE.getObjectByName("trackGears1_low_wall_e_0"),
            wallE.getObjectByName("trackGears2_low_wall_e_0"),
            wallE.getObjectByName("trackGears3_low_wall_e_0"),
            wallE.getObjectByName("trackGears4_low_wall_e_0"),
        ].filter(Boolean);

        const neck = wallE.getObjectByName("neck_low_wall_e_0");
        const eyes = wallE.getObjectByName("eyes_low_wall_e_0");
        const lenses = wallE.getObjectByName("eyes_low001_eyes_0");
        const leftArm = wallE.getObjectByName("hand_low001_wall_e_0");
        const rightArm = wallE.getObjectByName("hand_low002_wall_e_0");

        const body = [
            wallE.getObjectByName("back_low_wall_e_0"),
            wallE.getObjectByName("body_low_wall_e_0"),
        ].filter(Boolean);

        const base = wallE.getObjectByName("base_low_wall_e_0");

        this.state = {
            wheels,
            neck,
            eyes,
            lenses,
            leftArm,
            rightArm,
            body,
            base,
            roach,
            wheelSpin: 0,
            trackActions: [],
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

        this.roachMixer = new THREE.AnimationMixer(roach);

        if (models.roach.animations && models.roach.animations.length > 0) {
            const action = this.roachMixer.clipAction(models.roach.animations[0]);
            action.play();
            action.setLoop(THREE.LoopRepeat);
            action.timeScale = 1.3;
        }


        // ============================================================
        // 1. MAIN TIMELINE
        // ============================================================

        const tl = gsap.timeline({
            onComplete: onSceneComplete
        });

        // --------------------------------------------------
        // === 00:00 - 00:02 → Wall-E drives forward 2m ===
        // --------------------------------------------------

        tl.to(wallE.position, {
            z: 5,
            duration: 2,
            ease: "back.inOut",
            onStart: () => {
                gsap.to(this.state, {
                    wheelSpin: 12,   // fast rotation speed
                    duration: 0.4,
                    ease: "back.inOut"
                });
            },
            onComplete: () => {
                gsap.to(this.state, {
                    wheelSpin: 0,
                    duration: 0.6,   // smooth deceleration
                    ease: "back.inOut"
                });
            }
        });

        // // --------------------------------------------------
        // // === 00:02 – 00:04 → Look aroud ===
        // // --------------------------------------------------

        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            x: -0.20,
            z: 0.35,
            duration: 1.5,
            ease: "back.inOut"
        }, "-=1.4");

        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            x: -0.25,
            z: -0.40,
            duration: 1.4,
            ease: "back.inOut"
        });

        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            x: 0,
            z: 0,
            duration: 1.0,
            ease: "power2.inOut"
        });



        // // --------------------------------------------------
        // // === 00:04 – 00:06 → Sigh ===
        // // --------------------------------------------------
        tl.to([ 
            ...body.map(b => b.position),
            neck.position, 
            eyes.position,
            leftArm.position,
            rightArm.position,
            lenses.position,
        ], { z: "+=0.25", duration: 0.8, ease: "bounce.inOut" }, "-=0.5");

        tl.to([ base.position ], {
            z: "+=0.16",
            duration: 1.0,
            ease: "back.inOut"
        }, "<");

        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            x: -0.15,
            duration: 0.8,
            ease: "back.inOut"
        }, "<");

        tl.to([rightArm?.rotation].filter(Boolean), {
            x: "-=0.1",
            y: "+=0.3",
            duration: 0.8,
            ease: "back.inOut"
        }, "<");


        tl.to([leftArm?.rotation].filter(Boolean), {
            x: "-=0.1",
            y: "+=0.3",
            duration: 0.8,
            ease: "back.inOut"
        }, "<");
        

        tl.to({}, { duration: 0.6 });

        tl.to([ 
            ...body.map(b => b.position),
            neck.position, 
            eyes.position,
            leftArm.position,
            rightArm.position,
            lenses.position,
        ], { z: "-=0.25", duration: 1.2, ease: "back.inOut" }, "<");

        tl.to([ base.position ], {
            z: "-=0.2",
            duration: 1.2,
            ease: "back.inOut"
        }, "<");

        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            x: 0,
            duration: 0.8,
            ease: "back.inOut"
        }, "<");


        tl.to([rightArm?.rotation].filter(Boolean), {
            x: "+=0.1",
            y: "-=0.3",
            duration: 0.8,
            ease: "back.inOut"
        }, "<");


        tl.to([leftArm?.rotation].filter(Boolean), {
            x: "+=0.1",
            y: "-=0.3",
            duration: 0.8,
            ease: "back.inOut"
        }, "<");

        // --------------------------------------------------
        // === 00:06 – 00:08 → Forward then recoil ===
        // --------------------------------------------------

        // move forward
        tl.to(wallE.position, {
            z: 6.0,
            duration: 0.5,
            ease: "power1.in",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: 10, duration: 0.2 });
            }
        }, "+=0");
        tl.to(roach.scale, {
            y: 0.5,
            duration: 0.15,
            ease: "power1.in",
        }, "+=0");

        
        // roach
        const roachCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(6, 3.5, 4), // start (behind left of Wall-E)
            new THREE.Vector3(4, 3.5, 6), // small forward
            new THREE.Vector3(2, 3.5, 8), // begins to arc
            new THREE.Vector3(0.0, 3.6, 9), // rounding front
            new THREE.Vector3(-2, 3.6, 8.6), // around front right
            new THREE.Vector3(-2.2, 3.6, 8.0), // curve inwards
            new THREE.Vector3(-1.6, 3.5, 7.0), // ends in front of Wall-E
        ], false); // closed = false (not a loop)

        const roachMotion = { t: 0 };

        tl.to(roachMotion, {
            t: 1,
            duration: 2.2,
            ease: "none",
            onStart: () => roach.visible = true,
            onUpdate: () => {
                const p = roachCurve.getPoint(roachMotion.t);
                const dir = roachCurve.getTangent(roachMotion.t);
                
                roach.position.copy(p);

                // auto-face crawling direction
                const angle = Math.atan2(dir.x, dir.z);
                roach.rotation.y = angle;
            },
            onComplete: () => {
                if (this.roachMixer) gsap.to(this.roachMixer, { timeScale: 0, duration: 0.5, ease: "power2.out" }); // 🛑 stop crawl animation
            }
        }, "-=4.0");

        // accidental step
        tl.to({}, { duration: 0.3 });


        // look
        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            x: "+=0.25",
            duration: 0.3,
            ease: "back.inOut"
        }, "<");

        // recoil - surprise
        tl.to(wallE.position, {
            z: 5,
            duration: 0.3,
            ease: "power3.out",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: -14, duration: 0.1 });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.4 });
            }
        });

        tl.to([ 
            ...body.map(b => b.position),
            neck.position, 
        ], { z: "+=0.25", duration: 0.3, ease: "back.inOut" }, "<");

        tl.to([ base.position ], {
            z: "+=0.16",
            duration: 0.3,
            ease: "back.inOut"
        }, "<");
        
        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            x: "+=0.45",
            duration: 0.2,
            ease: "back.inOut"
        }, "<");

        tl.to([eyes?.position].filter(Boolean), {
            z: "+=1.05",
            duration: 0.2,
            ease: "back.inOut"
        }, "<");

        tl.to([lenses?.position].filter(Boolean), {
            z: "+=0.9",
            y: "+=0.15",
            duration: 0.2,
            ease: "back.inOut"
        }, "<");

        tl.to([rightArm?.rotation].filter(Boolean), {
            x: "-=1.5",
            y: "-=0.7",
            duration: 0.2,
            ease: "back.inOut"
        }, "<");

        tl.to([leftArm?.rotation].filter(Boolean), {
            x: "-=1.5",
            y: "-=0.7",
            duration: 0.2,
            ease: "back.inOut"
        }, "<");


        // disbelief
    
        tl.to([rightArm?.rotation].filter(Boolean), {
            x: "+=0.5",
            y: "+=1.9",
            duration: 0.2,
            ease: "back.inOut"
        },);

        tl.to([rightArm?.position].filter(Boolean), {
            z: "-=0.5",
            y: "-=1.0",
            duration: 0.2,
            ease: "back.inOut"
        },"<");
                
        tl.to([leftArm?.rotation].filter(Boolean), {
            x: "+=0.5",
            y: "+=1.7",

            duration: 0.2,
            ease: "back.inOut"
        },"<");

        tl.to([leftArm?.position].filter(Boolean), {
            z: "-=0.5",
            y: "-=0.7",
            duration: 0.2,
            ease: "back.inOut"
        },"<");

        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            z: "+=0.1",
            duration: 0.1,
            ease: "back.inOut"
        }, "+=0.1");

        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            z: "-=0.05",
            duration: 0.1,
            ease: "back.inOut"
        }, "+=0.1");

        tl.to([eyes?.rotation, lenses?.rotation].filter(Boolean), {
            z: "-=0.1",
            duration: 0.1,
            ease: "back.inOut"
        }, "+=0.2");




        // LEAN DOWN

        
        tl.to([leftArm?.rotation].filter(Boolean), {
            x: "+=0.3",
            y: -0.9,
            z: "-=1.2",
            duration: 0.6,
            ease: "power3.out"
        },);

        tl.to([leftArm?.position].filter(Boolean), {
            z: "+=0.2",
            y: "+=0.0",
            duration: 0.6,
            ease: "power3.out"
        },"<");

        tl.to(wallE.position, {
            z: "-=1.2",
            duration: 1.2,
            ease: "power2.inOut",
            onStart: () => {
                gsap.to(this.state, {
                    wheelSpin: -4,
                    duration: 0.3
                });
            },
            onComplete: () => {
                gsap.to(this.state, {
                    wheelSpin: 0,
                    duration: 0.6
                });
            }
        }, "-=0.3");
        tl.to([rightArm?.rotation].filter(Boolean), {
            x: "+=0.3",
            y: -1.0,
            z: "-=0.9",
            duration: 0.8,
            ease: "power3.out"
        }, "<");

        tl.to([rightArm?.position].filter(Boolean), {
            z: "+=0.2",
            y: "-=0.0",
            duration: 0.8,
            ease: "power3.out"
        },"<");
        

        tl.to([leftArm?.position].filter(Boolean), {
            y: "-=0.8",
            duration: 1.2,
            ease: "power2.inOut"
        },"<");
        
        tl.to([rightArm?.position].filter(Boolean), {
            y: "-=0.8",
            duration: 1.2,
            ease: "power2.inOut"
        },"<");
        
                
        tl.to([ 
            ...body.map(b => b.position),
        ], { z: "-=0.5",y: "-=0.35", duration: 1.2, ease: "back.inOut" }, "<");

        tl.to([ 
           neck.position,
        ], { y: "-=2.25", z:"-=1.0", duration: 1.2, ease: "back.inOut" }, "<");

        tl.to([ 
           eyes.position,
        ], { y: "-=3.25", z:"-=2.3", duration: 1.2, ease: "back.inOut" }, "<");
        tl.to([ 
           lenses.position,
        ], { y: "-=3.5", z:"-=2.3", duration: 1.2, ease: "back.inOut" }, "<");

        tl.to([ 
            ...body.map(b => b.rotation),
        ], { x: "+=1.35", duration: 1.2, ease: "back.inOut" }, "<");

        tl.to([ 
           neck.rotation,
        ], { x: "+=1.25", duration: 1.2, ease: "back.inOut" }, "<");

        tl.to([ 
           eyes.rotation,
        ], { x: "-=0.25", duration: 1.2, ease: "back.inOut" }, "<");

        tl.to([ 
           lenses.rotation,
        ], { x: "-=0.25", duration: 1.2, ease: "back.inOut" }, "<");


        tl.call(onSceneComplete, null, "-=0.5");

        this.timeline = tl;
    },

    // ============================================================
    // 2. PER-FRAME UPDATE (Procedural motion)
    // ============================================================

    update(delta, context) {
        if (!this.state) return;

        const { wheels, neck, eyes, lenses, body, wheelSpin, roach, trackActions } = this.state;

        wheels.forEach(w => {
            if (w) w.rotation.x += wheelSpin * delta;
        });

        if (trackActions) {
            trackActions.forEach(action => {
                action.timeScale = wheelSpin * 0.1; 
            });
        }

        if (this.state?.roach && Math.random() < 0.1) {
            this.state.roach.rotation.x += (Math.random() - 0.5) * 0.05;
        }

        if (this.roachMixer) this.roachMixer.update(delta);

    },

    // ============================================================
    // 3. CLEANUP
    // ============================================================

    end(context) {
        gsap.killTweensOf(this.state);
        gsap.killTweensOf(context.camera.position);
        gsap.killTweensOf(context.camera.rotation);

        if (context.mixers.wallE) {
            context.mixers.wallE.stopAllAction();
        }

        if (this.timeline) this.timeline.kill();
        this.state = null;

        // [BARU] CLEANUP ENVIRONMENT
        const { scene } = context;
        
        // Reset fog (opsional, jika scene lain pakai fog)
        scene.fog = null;
    }
};