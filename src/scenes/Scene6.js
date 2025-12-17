import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { models, camera, scene, mixers } = context;

        // ============================================================
        // 0. CLEANUP & DEEP CLEAN
        // ============================================================

        this.scene6Group = new THREE.Group();
        scene.add(this.scene6Group);

        
        this.clones = [];

        if(models.trashPile) models.trashPile.scene.visible = false; 
        if(models.trashCube) models.trashCube.scene.visible = false; 
        if(models.boat) models.boat.scene.visible = false;
        if(models.roach) models.roach.scene.visible = false;
        if (mixers.wallE) mixers.wallE.stopAllAction();

        const wallE = models.wallE.scene;
        wallE.traverse((child) => {
            if (child.isMesh) {
                if (child.name.includes("Scrap") || child.name.includes("Cube")) {
                    child.visible = false;
                    child.parent.remove(child); 
                }
            }
        });

        // ============================================================
        // 1. SETUP ENVIRONMENT (LANTAI DUPLIKAT & GEDUNG JAUH)
        // ============================================================

        const desertColor = 0xcc8e5a; 
        scene.background = new THREE.Color(desertColor);
        scene.fog = new THREE.FogExp2(desertColor, 0.0012); 

        // if (!this.sceneLight) {
        //     this.sceneLight = new THREE.HemisphereLight(0xffaa00, 0x444444, 1.5);
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

            const tileSize = 13;
            
            for (let x = -15; x <= 5; x++) {
                for (let z = -10; z <= 6; z++) {
                    const tile = floorModel.clone();
                    
                    tile.position.set(x * tileSize, -0.4, z * tileSize);
                    
                    const randomRot = Math.floor(Math.random() * 4) * (Math.PI / 2);
                    tile.rotation.set(0, randomRot, 0);
                    
                    tile.scale.set(1, 1, 1);
                    
                    this.floorGroup.add(tile);
                }
            }
        }

        if (models.buildingBrick) {
            const brickBg = models.buildingBrick.scene;
            brickBg.visible = true;
            brickBg.position.set(-120, -2, 20); 
            brickBg.rotation.set(0, -0.5, 0); 
            brickBg.scale.set(5, 5, 5);
            brickBg.traverse(o => o.frustumCulled = false);
            scene.add(brickBg);
        }

        if (models.buildingStore) {
            const storeBg = models.buildingStore.scene;
            storeBg.visible = true;
            storeBg.position.set(-65, -0.5, -80); 
            storeBg.rotation.set(0, -0.5, 0); 
            storeBg.scale.set(5, 5, 5);
            storeBg.traverse(o => o.frustumCulled = false);
            scene.add(storeBg);
        }

        if (models.buildingHigh) {
            const towerModel = models.buildingHigh.scene;
            const skyscraper = models.buildingHigh.scene;
            skyscraper.visible = true;
            skyscraper.position.set(-180, -340, -20); 
            skyscraper.scale.set(5, 20, 5); 
            skyscraper.rotation.set(0, -0.5, 0);
            skyscraper.traverse(o => o.frustumCulled = false);
            scene.add(skyscraper);

            const skyscraper1 = towerModel.clone();
            skyscraper1.visible = true;
            skyscraper1.position.set(-180, -340, -60); 
            skyscraper1.scale.set(5, 20, 5); 
            skyscraper1.rotation.set(0, -0.5, 0);
            skyscraper1.traverse(o => o.frustumCulled = false);
            scene.add(skyscraper1);
            this.clones.push(skyscraper1);
        }

        if (models.trashPile) {
            const pileModel = models.trashPile.scene;
            const pile = models.trashPile.scene;
            pile.visible = true;
            pile.position.set(10, -0.25, 49);
            pile.rotation.set(0, 2.5, 0); 
            pile.scale.set(1, 1, 1);
            this.scene6Group.add(pile);

            const pileLeft = pileModel.clone();
            pileLeft.visible = true;
            pileLeft.position.set(-100, -0.25, 20);
            pileLeft.rotation.set(0, -0.5, 0);
            pileLeft.scale.set(1.5, 1.5, 1.5);
            this.scene6Group.add(pileLeft);

            const pileRight = pileModel.clone();
            pileRight.visible = true;
            pileRight.position.set(0, -0.25, -50);
            pileRight.rotation.set(0, -0.5, 0); 
            pileRight.scale.set(1, 1, 1);
            this.scene6Group.add(pileRight);

            const pileRightBack = pileModel.clone();
            pileRightBack.visible = true;
            pileRightBack.position.set(30, -0.25, -70);
            pileRightBack.rotation.set(0, Math.PI, 0);
            pileRightBack.scale.set(1.25, 1.25, 1.25);
            this.scene6Group.add(pileRightBack);
        }
        // ============================================================
        // 2. SETUP KARAKTER
        // ============================================================
        
        wallE.visible = true;
        scene.add(wallE);
        wallE.position.set(0, 0, 0); 
        wallE.rotation.set(0, 0, 0);

        const bra = models.bra.scene;
        bra.visible = true;
        bra.scale.set(1, 1, 1);
        bra.position.set(-2, 0.0, 4.5); 
        bra.rotation.set(-1.4, 0.5, -1.5);
        scene.add(bra);

        camera.position.set(10, 3, 7); 
        camera.lookAt(-4, 3, 0);

        // ============================================================
        // 3. ANIMASI (TIDAK BERUBAH)
        // ============================================================
        
        const rightArm = wallE.getObjectByName("hand_low002_wall_e_0");
        const leftArm = wallE.getObjectByName("hand_low001_wall_e_0");
        const neck = wallE.getObjectByName("neck_low_wall_e_0");
        const eyes = wallE.getObjectByName("eyes_low_wall_e_0");
        const lenses = wallE.getObjectByName("eyes_low001_eyes_0");
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

        const tl = gsap.timeline({
            onComplete: onSceneComplete
        });

        if (rightArm) {
            rightArm.rotation.set(2.5,-1.2,-0.9);
            rightArm.position.z = -0.2;
            rightArm.position.y = -1.6;
            rightArm.position.x = -2.5;
        }
        if (leftArm) {
            leftArm.rotation.set(-0.7, -0.9, -1.2);
            leftArm.position.z = -0.1;
            leftArm.position.y = -0.5;
        }
        if (neck) {
            neck.position.z = 0.0;
            neck.position.y = -0.2;
            neck.rotation.x = 0.55;
        }
        if (eyes) {
            eyes.position.z = 0.05;
            eyes.position.y = -0.7;
            eyes.rotation.set(0.6,0,0);
        }
        if (lenses) {
            lenses.position.z = -0.3; 
            lenses.position.y = -0.6; 
            lenses.rotation.set(0.6,0,0);
        }

        this.state = {
            wheels,
            wheelSpin: 0,
            trackActions: []
        };

        const wallEMixer = mixers.wallE;
        if (wallEMixer && models.wallE.animations.length > 0) {
            wallEMixer.stopAllAction();
            models.wallE.animations.forEach(clip => {
                const action = wallEMixer.clipAction(clip);
                action.play();
                action.timeScale = 0;
                this.state.trackActions.push(action);
            });
        }

        this.originalParents = new Map();
        [
        rightArm, leftArm, neck, eyes, lenses,
        ...bodyParts
        ].filter(Boolean).forEach(p => {
        this.originalParents.set(p, p.parent);
        });

        this.originalParents = new Map();
        [
        rightArm, leftArm, neck, eyes, lenses,
        ...bodyParts
        ].filter(Boolean).forEach(p => {
        this.originalParents.set(p, p.parent);
        });

        
        this.leanGroup = new THREE.Group();
        wallE.add(this.leanGroup);

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


        // lean & reach
        
        tl.to(this.leanGroup.rotation, {
            x: "+=0.2",
            duration: 0.6,
            ease: "back.inOut"
        }); 

        // pick up
        tl.to(rightArm.rotation, {
            x: "-=1.2",
            duration: 0.8,
            ease: "power1.inOut"
        });

        tl.to(rightArm.position, {
            z: "-=0.5",
            duration: 0.8,
            ease: "power1.inOut"
        },"<");

        const eyeTL = gsap.timeline();

        eyeTL.to(this.eyeGroup.rotation, {
            x: "-=0.1",
            z: "-=0.15",
            y: "-=0.05",
            duration: 0.4,
            ease: "power1.out"
        });

        eyeTL.to(this.eyeGroup.position, {
            z: "+=0.2",
            y: "+=0.2",
            duration: 0.6,
            ease: "power1.in"
        }, "<");


        eyeTL.to(this.eyeGroup.rotation, {
            x: "-=0.1",
            z: "-=0.1",
            duration: 0.6,
            ease: "back.out(1.5)"
        }, "<");

        tl.add(eyeTL, "<");

        tl.to(this.leanGroup.rotation, {
            x: "-=0.1",
            duration: 0.4,
            ease: "power2.inOut"
        }, "<");

        tl.to(bra.position, {
            y: "+=2.2",
            z:"-=1.2",
            duration: 0.8,
            ease: "power1.inOut"
        }, "<");

        tl.to(bra.rotation, {
            y: "-=0.7",
            x: "+=1.5",
            duration: 0.8,
            ease: "power1.inOut"
        }, "<");


        //  left arm grab

        tl.to(leftArm.rotation, {
            y: "+=0.9",
            duration: 0.5,
            ease: "power4.in"
        }, "-=0.6");

        tl.to(leftArm.position, {
            z: "+=1.4",
            duration: 0.5,
            ease: "power4.in"
        },"<");

        tl.to(this.eyeGroup.rotation, {
            y: "-=0.1",
            duration: 0.5,
            ease: "power4.in"
        },"<");


        tl.to(leftArm.rotation, {
            y: "+=0.8",
            x: "-=0.1",
            z: "+=1.8",
            duration: 0.5,
            ease: "back.inOut"
        });

        tl.to(leftArm.position, {
            z: "-=1.8",
            y: "-=0.3",
            duration: 0.5,
            ease: "back.inOut"
        },"<");

        tl.to(rightArm.rotation, {
            x: "+=1.5",
            y: "-=1.2",
            z: "-=1.1",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");

        tl.to(rightArm.position, {
            z: "-=1.3",
            x: "-=0.4",
            y: "+=0.5",
            // x: "-=0.4",
            duration: 0.5,
            ease: "back.inOut"
        },"<");


        tl.to(bra.position, {
            y: "-=0.5",
            z:"-=0.4",
            x:"+=1.9",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");

        tl.to(bra.rotation, {
            z: "+=1.5",
            y: "+=0.2",
            // x: "+=0.2",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");


       tl.to([eyes.rotation, lenses.rotation], {
            z: "+=0.3",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");

        tl.to([lenses.position], {
            y: "+=0.1",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");


        // shock

        tl.to(this.leanGroup.rotation, {
            x: "-=0.1",
            duration: 0.4,
            ease: "power2.inOut"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.3",
            y: "+=0.1",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");


        eyeTL.to(this.eyeGroup.position, {
            x: "-=0.2",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");


        tl.to([eyes.position, lenses.position], {
            y: "+=0.4",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");


        tl.to(neck.rotation, {
            x: "-=0.2",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");

        tl.to(neck.position, {
            z: "-=0.2",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");


        tl.to([rightArm.rotation, leftArm.rotation], {
            x: "-=0.5",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");

        
        tl.to([rightArm.position, leftArm.position], {
            z: "+=0.9",
            y: "-=0.3",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");


        tl.to(bra.position, {
            y: "+=1.2",
            duration: 0.5,
            ease: "back.inOut"
        }, "<");

        
        tl.to([eyes.rotation, lenses.rotation], {
            z: "+=0.1",
            duration: 0.4,
            ease: "back.out"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            z: "-=0.1",
            duration: 0.4,
            ease: "back.out"
        });

        // tl.to([], {duration: 0.3});

        tl.to([eyes.position, lenses.position], {
            z: "-=0.1",
            y: "+=0.1",
            duration: 0.3,
            ease: "power2.in"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.1",
            duration: 0.3,
            ease: "power2.in"
        }, "<");

        tl.to(neck.rotation, {
            x: "-=0.1",
            duration: 0.3,
            ease: "power2.in"
        }, "<");

        tl.to(neck.position, {
            z: "-=0.1",
            y: "+=0.1",
            duration: 0.3,
            ease: "power2.in"
        }, "<");

        //  closer

        tl.to([eyes.position, lenses.position], {
            z: "+=0.1",
            y: "-=0.2",
            duration: 1.1,
            ease: "power4.out"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.1",
            duration: 1.1,
            ease: "power4.out"
        }, "<");

        tl.to(neck.rotation, {
            x: "+=0.1",
            duration: 1.1,
            ease: "power4.out"
        }, "<");

        tl.to(neck.position, {
            z: "+=0.1",
            y: "-=0.1",
            duration: 1.1,
            ease: "power4.out"
        }, "<");

        tl.to([rightArm.rotation, leftArm.rotation], {
            x: "-=0.1",
            duration: 1.1,
            ease: "power4.out"
        }, "<");
        
        tl.to([rightArm.position, leftArm.position], {
            z: "+=0.1",
            y: "+=0.1",
            duration: 1.1,
            ease: "power4.out"
        }, "<");

        tl.to(bra.position, {
            y: "+=0.3",
            z: "-=0.1",
            duration: 1.1,
            ease: "power4.out"
        }, "<");

        tl.to(bra.rotation, {
            x: "-=0.1",
            duration: 1.1,
            ease: "power4.out"
        }, "<");


        // back out

        tl.to([rightArm.rotation, leftArm.rotation], {
            x: "+=0.1",
            duration: 0.5,
            ease: "power4.out"
        });

        tl.to([rightArm.rotation, leftArm.rotation], {
            y: "+=0.1",
            duration: 0.5,
            ease: "power4.out"
        }, "<");

        tl.to(bra.rotation, {
            x: "+=0.2",         
            duration: 0.5,
            ease: "power4.out"
        }, "<");

        tl.to(bra.position, {
            y: "-=0.1",         
            duration: 0.5,
            ease: "power4.out"
        }, "<");


        tl.to([eyes.position, lenses.position], {
            z: "-=0.2",
            y: "+=0.1",
            duration: 0.5,
            ease: "power4.out"
        }, "<");

        tl.to([eyes.rotation, lenses.rotation], {
            // x: "-=0.1",
            duration: 0.5,
            ease: "power4.out"  
        }, "<");


        tl.to(neck.rotation, {
            x: "-=0.1",
            duration: 0.5,
            ease: "power4.out"
        }, "<");

        tl.to(neck.position, {
            z: "-=0.1",
            duration: 0.5,
            ease: "power4.out"
        }, "<");



        // closerer

        tl.to([eyes.position, lenses.position], {
            z: "+=0.2",
            y: "-=0.1",
            duration: 0.9,
            ease: "power4.out"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            y: "+=0.1",
            duration: 0.9,
            ease: "power4.out"
        }, "<");

        tl.to(neck.rotation, {
            x: "+=0.1",
            duration: 0.9,  
            ease: "power4.out"
        }, "<");

        tl.to(neck.position, {
            z: "+=0.1",
            y: "-=0.1",
            duration: 0.9,
            ease: "power4.out"
        }, "<");

        tl.to([rightArm.rotation, leftArm.rotation], {
            x: "-=0.3",
            duration: 1.1,
            ease: "power4.out"
        }, "<");
        
        tl.to([rightArm.position, leftArm.position], {
            z: "+=0.1",
            y: "-=0.2",
            duration: 1.1,
            ease: "power4.out"
        }, "<");

        tl.to(bra.position, {
            y: "+=0.3",
            z: "-=0.4",
            duration: 1.1,
            ease: "power4.out"
        }, "<");

        tl.to(bra.rotation, {
            x: "-=0.1",
            duration: 1.1,
            ease: "power4.out"
        }, "<");




        // put on bra

        tl.to([eyes.position, lenses.position], {
            z: "+=0.2",
            y: "-=0.4",
            x: "-=0.1",
            duration: 0.7,
            ease: "power4.out"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            z: "-=0.1",
            y: "-=0.3",
            duration: 0.7,
            ease: "power4.out"
        }, "<");

        tl.to(neck.rotation, {
            // x: "+=0.1",
            duration: 0.7,  
            ease: "power4.out"
        }, "<");

        tl.to(neck.position, {
            z: "+=0.2",
            y: "-=0.1",
            duration: 0.7,
            ease: "power4.out"
        }, "<");


        tl.to([rightArm.rotation, leftArm.rotation], {
            x: "-=0.3",
            duration: 0.7,
            ease: "power4.out"
        }, "<");
        
        tl.to([rightArm.position, leftArm.position], {
            z: "+=0.1",
            y: "-=0.2",
            duration: 0.7,
            ease: "power4.out"
        }, "<");

        tl.to(bra.position, {
            x: "+=0.2",
            y: "+=0.3",
            z: "-=0.5",
            duration: 0.7,
            ease: "power4.out"
        }, "<");

        tl.to(bra.rotation, {
            x: "-=0.1",
            duration: 0.7,
            ease: "power4.out"
        }, "<");


        // push back

        tl.to([rightArm.rotation, leftArm.rotation], {
            x: "-=0.5",
            z: "+=0.3",
            duration: 0.4,
            ease: "power4.inOut"
        }, "-=0.4");

        tl.to(bra.position, {
            z: "-=0.5",
            y: "+=0.2",
            duration: 0.4,
            ease: "power4.inOut"
        }, "<");

        tl.to([rightArm.rotation], {
            x: "+=1.2",
            // z: "-=0.3",
            duration: 0.4,
            ease: "power4.inOut"
        });

        tl.to([leftArm.rotation], {
            x: "+=1.3",
            duration: 0.4,
            ease: "power4.inOut"
        }, "<");

        tl.to([rightArm.position], {
            z: "-=1",
            y: "+=0.3",
            duration: 0.4,
            ease: "power4.inOut"
        }, "<");

        tl.to([leftArm.position], {
            x: "-=0.2",
            y: "+=0.6",
            z: "-=1.3",
            duration: 0.4,
            ease: "power4.inOut"
        }, "<");

        tl.to([eyes.position, lenses.position], {
            z: "-=0.2",
            y: "+=0.1",
            duration: 0.7,
            ease: "power4.inOut"
        }, "<");

        tl.to(bra.position, {
            z: "-=0.2",
            y: "+=0.1",
            duration: 0.7,
            ease: "power4.inOut"
        }, "<");

        tl.to(neck.rotation, {
            x: "-=0.1",
            duration: 0.7,  
            ease: "power4.inOut"
        }, "<");

        tl.to(neck.position, {
            z: "-=0.2",
            y: "+=0.1",
            duration: 0.7,
            ease: "power4.inOut"
        }, "<");


        // aback

        tl.to(wallE.position, {
            z: "-=0.4",
            duration: 0.3,
            ease: "back.in",
            onStart: () => {
                gsap.to(this.state, {
                    wheelSpin: -3,
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
        });

        tl.to(this.leanGroup.rotation, {
            x: "-=0.12",
            duration: 0.3,
            ease: "back.in"
        }, "<");

        tl.to(neck.rotation, {
            x: "-=0.15",
            duration: 0.3,
            ease: "back.in"
        }, "<");

        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.12",
            z: "+=0.45",
            duration: 0.3,
            ease: "back.in"
        }, "<");

        tl.to(bra.rotation, {
            x: "-=0.12",
            y: "+=0.6",
            duration: 0.3,
            ease: "back.in"
        }, "<");

        tl.to(bra.position, {
            x: "+=0.55",
            y: "+=0.15",
            z: "-=0.5",
            duration: 0.3,
            ease: "back.in"
        }, "<");

        tl.to(this.leanGroup.rotation, {
            x: "+=0.12",
            duration: 0.3,
            ease: "back.out"
        });

        tl.to(neck.rotation, {
            x: "+=0.15",
            duration: 0.3,
            ease: "back.out"
        }, "<");

        tl.to([eyes.rotation, lenses.rotation], {
            x: "+=0.12",
            duration: 0.3,
            ease: "back.out"
        }, "<");

        tl.to(bra.rotation, {
            x: "+=0.12",
            duration: 0.3,
            ease: "back.out"
        }, "<");

        tl.to(bra.position, {
            y: "-=0.2",
            duration: 0.3,
            ease: "back.out"
        }, "<");
        
        tl.to(wallE.rotation, {
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
        });


        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.6",
            z: "+=0.2",
            y: "-=0.4",
            duration: 0.8,
            ease: "back.inOut"
        }, "<");

        tl.to(bra.rotation, {
            x: "-=1",
            z: "+=1",
            y: "+=0.4",
            duration: 0.8,
            ease: "back.inOut"
        }, "<");

        
        tl.to(bra.position, {
            x: "+=0.6",
            y: "+=0.6",
            z: "-=0.6",
            // x: "+=0.2",
            duration: 0.8,
            ease: "back.inOut"
        }, "<");

        
        
        tl.to(wallE.rotation, {
            y: "-=0.35",
            duration: 0.6,
            ease: "back.inOut",
            onStart: () => {
                gsap.to(this.state, {
                    wheelSpin: 3.5,
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
        });


        tl.to([eyes.rotation, lenses.rotation], {
            z: "-=1",
            y: "+=0.5",
            duration: 0.6,
            ease: "back.inOut"
        }, "<");


        tl.to(bra.rotation, {
            x: "+=0.7",
            z: "-=1",
            y: "-=1.2",
            duration: 0.6,
            ease: "back.inOut"
        }, "<");

        
        tl.to(bra.position, {
            x: "-=1.2",
            y: "-=0.2",
            z: "+=0.8",
            duration: 0.6,
            ease: "back.inOut"
        }, "<");


        tl.to(wallE.rotation, {
            y: "+=0.2",
            duration: 0.6,
            ease: "back.inOut",
            onStart: () => {
                gsap.to(this.state, {
                    wheelSpin: 3.5,
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
        });

        tl.to([eyes.rotation, lenses.rotation], {
            x: "+=0.5",
            z: "+=0.5",
            y: "-=0.1",
            duration: 0.6,
            ease: "back.inOut"
        }, "<");

        tl.to(bra.rotation, {
            x: "-=0.3",
            z: "+=0.5",
            y: "+=0.8",
            duration: 0.6,
            ease: "back.inOut"
        }, "<");

        tl.to(bra.position, {
            x: "+=0.9",
            y: "-=0.4",
            z: "-=0.3",
            duration: 0.6,
            ease: "back.inOut"
        }, "<");


        // left arm grab

        tl.to(leftArm.rotation, {
            x: "-=0.5",
            // z: "+=0.5",
            // y: "+=0.8",
            duration: 0.2,
            ease: "power1.in"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            x: "+=0.5",
            duration: 0.2,
            ease: "power1.in"
        }, "<");

        tl.to(bra.position, {
            y: "-=0.2",
            duration: 0.2,
            ease: "power1.in"
        }, "<");


        tl.to(leftArm.rotation, {
            x: "+=0.8",
            // z: "+=0.5",
            // y: "+=0.8",
            duration: 0.2,
        });

        // tl.to(bra.rotation, {
        //     x: "-=0.3",
        //     z: "+=0.5",
        //     y: "+=0.8",
        //     duration: 0.6,
        //     ease: "back.inOut"
        // }, "<");

        tl.to(bra.position, {
            // x: "+=0.9",
            y: "-=1.6",
            y: "-=1.6",
            // z: "-=0.3",
            duration: 0.2,
        }, "<");

        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.5",
            duration: 0.2,
            ease: "power1.in"
        }, "<");

        tl.to(leftArm.rotation, {
            x: "-=1",
            // z: "+=0.5",
            // y: "+=0.8",
            duration: 0.2,
        });

        tl.to(bra.position, {
            // x: "+=0.9",
            y: "+=7.8",
            y: "+=7.8",
            z: "-=1.8",
            // z: "-=0.3",
            duration: 0.2,
        }, "<");

        tl.to(leftArm.rotation, {
            x: "+=0.7",
            // z: "+=0.5",
            // y: "+=0.8",
            duration: 0.3,
            ease: "back.out"
        });

        tl.to([eyes.rotation, lenses.rotation], {
            x: "-=0.2",
            z: "-=0.3",
            duration: 0.6,
            ease: "back.inOut"
        }, "<");
        

        this.timeline = tl;
    },

    update(delta, context) {
        if (!this.state) return;
        const { wheels, wheelSpin, trackActions } = this.state;
        trackActions.forEach(action => { action.timeScale = wheelSpin * 0.1; });
        wheels.forEach(w => { if (w) w.rotation.x += wheelSpin * delta; });
    },

    end(context) {
        if (this.timeline) this.timeline.kill();
        const { models, scene } = context;
        const wallE = models.wallE.scene;

        if (this.originalParents) {
            this.originalParents.forEach((parent, part) => {
                parent.attach(part);
            });
            this.originalParents.clear();
        }

        if (this.eyeGroup) {
            this.eyeGroup.removeFromParent();
            this.eyeGroup = null;
        }

        if (this.leanGroup) {
            this.leanGroup.removeFromParent();
            this.leanGroup = null;
        }

        wallE.position.set(0, 0, 0);
        wallE.rotation.set(0, 0, 0);
        wallE.scale.set(1, 1, 1);
        
        scene.attach(models.bra.scene); 
        models.bra.scene.visible = false; 
        models.wallE.scene.visible = false; 

        if(models.buildingBrick) models.buildingBrick.scene.visible = false;
        if(models.buildingHigh) models.buildingHigh.scene.visible = false;
        if(models.buildingStore) models.buildingHigh.scene.visible = false;
        if(models.trashPile) models.trashPile.scene.visible = false; 
        if(models.floor) models.floor.scene.visible = false;

        if (this.envGroup) {
            scene.remove(this.envGroup);
            this.envGroup = null;
        }
        if (this.clones) {
            this.clones.forEach(clone => {
                scene.remove(clone);
            });
            this.clones = []; 
        }
        if (this.floorGroup) {
            scene.remove(this.floorGroup);
            this.floorGroup = null;
        }

        if (this.sceneLight) scene.remove(this.sceneLight);
        if (this.sceneSun) scene.remove(this.sceneSun);
        scene.fog = null;

        if (models.trashPile?.scene) {
            models.trashPile.scene.visible = false;
        }

        if (this.scene6Group) {
            this.scene6Group.traverse(obj => {
                if (obj.isMesh) {
                    obj.geometry?.dispose();
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material?.dispose();
                    }
                }
            });

            scene.remove(this.scene6Group);
            this.scene6Group = null;
        }

    }
};