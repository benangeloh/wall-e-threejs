import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { models, camera, scene, mixers } = context;

        // ============================================================
        // 0. CLEANUP PREVIOUS SCENE
        // ============================================================
        if(models.trashPile) models.trashPile.scene.visible = false;
        if(models.floor) models.floor.scene.visible = false;
        if(models.trashCube) models.trashCube.scene.visible = false;
        if(models.boat) models.boat.scene.visible = false;
        if(models.roach) models.roach.scene.visible = false;
        if (mixers.wallE) mixers.wallE.stopAllAction();
        if (mixers.wallEKey) mixers.wallEKey.stopAllAction();

        if(models.buildingBrick) models.buildingBrick.scene.visible = false;
        if(models.buildingHigh) models.buildingHigh.scene.visible = false;
        if(models.towerModel) models.towerModel.scene.visible = false;
        if(models.buildingStore) models.buildingStore.scene.visible = false;
        if(models.towermodel) models.buildingHigh.scene.visible = false;


        // ============================================================
        // 1. SETUP ENVIRONMENT
        // ============================================================
        
        const wallE = models.wallE.scene;
        wallE.visible = false;
        scene.add(wallE);

        wallE.position.set(-1, 10, 2); 
        wallE.rotation.set(0, 0.6, 0);


        camera.position.set(14.85, 12.85 ,6.75); // camera.position.set(10, 6, 5);
        camera.lookAt(-1.11, 11.8, -2.05);

        const trashPile = models.trashPile.scene;
        trashPile.visible = true;

        trashPile.position.set(25, -2, 0);
        trashPile.rotation.set(-0.2, 3.0, 0);
        trashPile.scale.set(1, 1, 1);

        scene.add(trashPile);


        const wallEKey = models.wallEKey.scene;
        wallEKey.visible = true;
        scene.add(wallEKey);

        wallEKey.position.set(-1, 10, 2); 
        wallEKey.rotation.set(0, 0.8, 0);


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

        // if (models.floor) {
        //     const floorModel = models.floor.scene;
        //     floorModel.visible = true;
            
        //     this.floorGroup = new THREE.Group();
        //     scene.add(this.floorGroup);

        //     const tileSize = 10; 
        //     // Loop lantai agar luas
        //     for (let x = -10; x <= 10; x++) {
        //         for (let z = -10; z <= 10; z++) {
        //             const tile = floorModel.clone();
        //             tile.position.set(x * tileSize, -32, z * tileSize);
                    
        //             const randomRot = Math.floor(Math.random() * 4) * (Math.PI / 2);
        //             tile.rotation.set(0, randomRot, 0);
                    
        //             this.floorGroup.add(tile);
        //         }
        //     }
        // }

        // ============================================================
        // 2. GET PARTS
        // ============================================================
        
        const rightArm = wallEKey.getObjectByName("hand_low002_wall_e_0");
        const leftArm = wallEKey.getObjectByName("hand_low001_wall_e_0");
        const neck = wallEKey.getObjectByName("neck_low_wall_e_0");
        const eyes = wallEKey.getObjectByName("eyes_low_wall_e_0");
        const lenses = wallEKey.getObjectByName("eyes_low001_eyes_0");
        const bodyParts = [
            wallEKey.getObjectByName("back_low_wall_e_0"),
            wallEKey.getObjectByName("body_low_wall_e_0"),
        ].filter(Boolean);

        const wheels = [
            wallEKey.getObjectByName("trackGears1_low_wall_e_0"),
            wallEKey.getObjectByName("trackGears2_low_wall_e_0"),
            wallEKey.getObjectByName("trackGears3_low_wall_e_0"),
            wallEKey.getObjectByName("trackGears4_low_wall_e_0"),
        ].filter(Boolean);


        
        const floorScene = models.floor.scene;
        const floorMesh = floorScene.getObjectByName("Object_2");

        if (floorMesh) {
            floorScene.visible = true;

            floorScene.position.set(0, -2, 0);
            floorScene.rotation.set(0, 0, 0);
            floorScene.scale.set(3, 3, 3);

            scene.add(floorScene);
        }

        // ============================================================
        // 3. TIMELINE
        // ============================================================

        const tl = gsap.timeline({
            onComplete: onSceneComplete
        });

        if (rightArm) {
        //     rightArm.rotation.set(2.5,-1.2,-0.9);
        //     rightArm.position.z = -0.2;
        //     rightArm.position.y = -1.6;
        //     rightArm.position.x = -2.5;
        }

        if (leftArm) {
            leftArm.rotation.set(-1.2, -0.9, -1.2);
            leftArm.position.z = 0.1;
            leftArm.position.y = -0.5;
        }

        if (neck) {
            neck.position.z = 0.0;
            neck.position.y = -0.2;
            neck.rotation.x = 0.55;
        }

        if (eyes) {
            eyes.position.z = 0.5;
            eyes.position.y = -0.3;
            eyes.rotation.set(0.6,0,0);
        }
        if (lenses) {
            lenses.position.z = 0.3; // (0.9 - 2.3)
            lenses.position.y = -0.3; // (0.15 - 3.5)
            lenses.rotation.set(0.6,0,0);
        }

        this.state = {
            wheels,
            wheelSpin: 0,
            trackActions: []
        };

        const wallEKeyMixer = mixers.wallEKey;

        if (wallEKeyMixer && models.wallEKey.animations.length > 0) {
            models.wallEKey.animations.forEach(clip => {
                const action = wallEKeyMixer.clipAction(clip);
                action.play();
                action.timeScale = 0;
                this.state.trackActions.push(action);
            });
        }
        
        this.originalParents = new Map();

        [
            rightArm,
            leftArm,
            neck,
            eyes,
            lenses,
            ...bodyParts
        ].filter(Boolean).forEach(part => {
            this.originalParents.set(part, part.parent);
        });

        
        this.leanGroup = new THREE.Group();
        wallEKey.add(this.leanGroup);

        [
            ...bodyParts,
            neck,
            eyes,
            lenses,
            leftArm,
            rightArm
        ].filter(Boolean).forEach(part => {
            this.leanGroup.attach(part);
        });


        this.eyeGroup = new THREE.Group();
        this.leanGroup.add(this.eyeGroup);

        [lenses, eyes].filter(Boolean).forEach(part => {
            this.eyeGroup.attach(part);
        });



        

        tl.to([eyes.rotation, lenses.rotation], {
            z: "-=0.4",
            // z: "-=1.2",
            duration: 0.8,
            ease: "power1.in"
        }, "<" );

        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.4",
            // z: "-=1.2",
            duration: 0.6,
            ease: "power1.out"
        }, "-=0.2");


        tl.to(rightArm.rotation, {
            x: "-=1.3",
            // z: "-=1.2",
            duration:0.7,
            ease: "power1.inOut"
        }, "-=0.5");

        tl.to(rightArm.position, {
            z: "+=1",
            y: "-=0.7",
            duration:0.7,
            ease: "power1.inOut"
        },"<");


        tl.to([], {duration:0.3});

        tl.to(rightArm.rotation, {
            z: "-=0.2",
            y: "-=0.2",
            duration: 0.4,
            ease: "power1.inOut"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            z: "+=0.1",
            duration: 0.4,
            ease: "power1.in"
        }, "<" );

        tl.to(rightArm.rotation, {
            z: "+=0.2",
            y: "+=0.2",
            // z: "-=1.2",
            duration:0.4,
            ease: "power1.inOut"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            z: "-=0.2",
            y: "+=0.1",
            duration: 0.4,
            ease: "power1.in"
        }, "<" );


        tl.to([], {duration:0.3});


        tl.to(rightArm.rotation, {
            x: "+=0.2",
            // z: "-=1.2",
            duration:0.4,
            ease: "back.in"
        });


        tl.to(rightArm.rotation, {
            x: "-=0.2",
            // z: "-=1.2",
            duration:0.4,
            ease: "back.out"
        });

        tl.to(this.leanGroup.rotation, {
            x: "-=0.1",
            duration: 0.3,
            ease: "back.out"
        });

        tl.to([eyes.position, lenses.position], {
            z: "-=0.1",
            y: "+=0.1",
            duration: 0.3,
            ease: "back.out"
        }, "<");

        tl.to(neck.rotation, {
            x: "-=0.3",
            duration: 0.3,
            ease: "back.out"
        }, "<");

        tl.to(neck.position, {
            y: "+=0.2",
            duration: 0.3,
            ease: "back.out"
        }, "<");

        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.3",
            z: "+=0.3",
            y: "-=0.1",
            duration: 0.3,
            ease: "back.out"
        }, "<" );


        tl.to([eyes.rotation, lenses.rotation], {
            z: "+=0.3",
            duration: 0.2,
            ease: "power1.in"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            z: "+=0.3",
            duration: 0.2,
            // ease: "power1.in"
        });

        tl.to(wallEKey.rotation, {
            y: "+=0.55",
            duration: 0.8,
            ease: "back.inOut",
            onStart: () => {
                gsap.to(this.state, {
                    wheelSpin: -3.5,
                    duration: 0.2,
                    ease: "power2.in"
                });
            },
            onComplete: () => {
                gsap.to(this.state, {
                    wheelSpin: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        }, "<");

        tl.to([eyes.rotation, lenses.rotation], {
            z: "+=0.8",
            duration: 0.3,
            ease: "power1.out"
        });

        tl.to(wallEKey.rotation, {
            y: "+=0.05",
            duration: 0.4,
            ease: "back.inOut",
            onStart: () => {
                gsap.to(this.state, {
                    wheelSpin: -0.5,
                    duration: 0.3,
                    ease: "power2.in"
                });
            },
            onComplete: () => {
                gsap.to(this.state, {
                    wheelSpin: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        }, "<");



        this.timeline = tl;
    },

    update(delta, context) {
        if (!this.state) return;

        const { wheels, wheelSpin, trackActions } = this.state;

        trackActions.forEach(action => {
            action.timeScale = wheelSpin * 0.1;
        });

        wheels.forEach(w => {
            if (w) w.rotation.x += wheelSpin * delta;
        });
    },


    end(context) {
        if (this.timeline) this.timeline.kill();

        const { models, scene } = context;

        if (this.originalParents) {
            this.originalParents.forEach((parent, part) => {
                parent.attach(part);
            });
            this.originalParents.clear();
            this.originalParents = null;
        }

        if (this.eyeGroup) {
            this.eyeGroup.removeFromParent();
            this.eyeGroup = null;
        }

        if (this.leanGroup) {
            this.leanGroup.removeFromParent();
            this.leanGroup = null;
        }

        const wallEKey = models.wallEKey.scene;
        wallEKey.position.set(0, 0, 0);
        wallEKey.rotation.set(0, 0, 0);
        wallEKey.scale.set(1, 1, 1);

        // Optional visibility cleanup
        wallEKey.visible = false;

        if (models.floor) models.floor.scene.visible = false;
        if (models.trashPile) models.trashPile.scene.visible = false;
    }

};