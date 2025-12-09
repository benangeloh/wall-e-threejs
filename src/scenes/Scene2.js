import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { models, camera, scene } = context;

        const wallE = models.wallE.scene;
        const boat = models.boat.scene;
        const roach = models.roach.scene;

        // ============================================================
        // 0. INITIAL SETUP
        // ============================================================

        // camera.position.set(5, 6, 14);
        // camera.lookAt(-4, 6, 1);
        camera.position.set(0.5, 3.7, 7.6);
        camera.lookAt(-2, 4, 5.8);

        boat.scale.set(1.5, 1.5, 1.5); 
        boat.position.set(0, -2.2, -19);
        boat.visible = true;
        scene.add(boat);

        // --- WALL-E GLOBAL POSITION ---
        wallE.position.set(-0.2, 3.5, 3.6); 
        wallE.rotation.set(0, -0.18, 0);
        scene.add(wallE);

        // --- ROACH POSITION ---
        roach.scale.set(1, 0.5, 1);
        roach.position.set(-1., 3.5, 7.2);
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
        if (base) base.position.z = 0.12;

        body.forEach(b => {
            b.position.z = -0.25;
            b.position.y = -0.35;
            b.rotation.x = 1.35;
        });

        // --- B. NECK ---
        if (neck) {
            neck.position.z = -0.75;
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
            rightArm.rotation.set(3.5,-1.,-0.1);
            rightArm.position.z = -0.7;
            rightArm.position.y = -0.9;
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
            wheelSpin: 0
        };

        // this.roachMixer = new THREE.AnimationMixer(roach);
        // if (models.roach.animations && models.roach.animations.length > 0) {
        //     const action = this.roachMixer.clipAction(models.roach.animations[0]);
        //     action.play();
        //     action.timeScale = 1.3; 
        // }

        // ============================================================
        // 3. NEW TIMELINE
        // ============================================================

        const tl = gsap.timeline({
            onComplete: onSceneComplete
        });
     
        tl.to(wallE.position, {
            z: "-=0.8",             // continue sliding back
            duration: 2,
            ease: "back.out",
            onStart: ()=> gsap.to(this.state,{ wheelSpin:-6,duration:0.6 }),
            onComplete:()=> gsap.to(this.state,{ wheelSpin:0,duration:0.8 })
        });

        tl.to([...body.map(b => b.rotation)], {
            x: "+=0.45",            // body tilts forward more
            duration: 2,
            ease: "back.out"
        }, "<");

        tl.to([...body.map(b => b.position)], {
            y: "-=0.25",            // chest lowers more
            z: "-=0.35",
            duration: 2,
            ease: "back.out"
        }, "<");

        tl.to(neck.position,{
            y: "-=0.35",
            z: "-=1.4",
            duration: 2,
            ease: "back.out"
        },"<");

        tl.to(neck.rotation,{
            x: "+=0.35",
            duration: 2,
            ease: "back.out"
        },"<");

        // eyes + Lenses droop w/ head
        tl.to([eyes.position],{
            y: "-=0.25",
            z: "-=1.325",
            duration: 2,
            ease: "back.out"
        },"<");

        tl.to([lenses.position],{
            y: "-=0.15",
            z: "-=1.325",
            duration: 2,
            ease: "back.out"
        },"<");

        tl.to([eyes.rotation,lenses.rotation],{
            x: "-=0.1",        // subtle soften instead of stiff stare
            duration: 2,
            ease: "back.out"
        },"<");

        // ---------------------------------------------
        //  ROACH JUMP + UNSQUISH
        // ---------------------------------------------

        tl.to(roach.scale, {
            y: 1,
            duration: 0.25,
            ease: "back.out(3)"
        }, "-=0.3");

        tl.to(roach.position, {
            y: "+=0.5", // small hop
            duration: 0.28,
            ease: "power2.out"
        }, "<");
        
        tl.to([eyes.rotation,lenses.rotation],{
            x: "-=0.1",
            // y: "-=0.1",
            duration: 0.3,
            ease: "back.out"
        },"<");

        tl.to(roach.position, {
            y: "-=0.5",
            duration: 0.25,
            ease: "power1.in"
        });
        tl.to([eyes.rotation,lenses.rotation],{
            x: "+=0.1",
            // y: "+=0.2",
            duration: 0.5,
            ease: "back.out"
        },"<");

        // ============================
        // Wall-E leans up
        // ============================
        
        tl.to([...body.map(b=>b.rotation)], {
            x: "-=1.05",
            duration: 1.2,
            ease: "back.inOut"
        });

        tl.to([...body.map(b=>b.position)], {
            y: "+=0.25",
            z: "+=0.35",
            duration: 1.2,
            ease: "back.inOut"
        }, "<");

        tl.to(neck.position,{
            y: "+=0.35",
            z: "+=1.4",
            duration: 1.2,
            ease:"back.inOut"
        },"<");

        tl.to(neck.rotation,{
            x: "-=0.35",
            duration: 1.2,
            ease:"back.inOut"
        },"<");

        tl.to([eyes.position,lenses.position],{
            y: "+=0.25",
            z: "+=1.6",
            duration: 1.2,
            ease:"back.inOut"
        },"<");

        tl.to([eyes.rotation,lenses.rotation],{
            x: "+=0.1",
            duration: 1.2,
            ease:"back.inOut"
        },"<");

        // === Wheels push forward while standing back up ===
        tl.to(wallE.position, {
            z: "+=0.9", // small drive forward
            duration: 2,
            ease: "power2.inOut",
            onStart: () => {
                gsap.to(this.state, { wheelSpin: 8, duration: 0.3 });
            },
            onComplete: () => {
                gsap.to(this.state, { wheelSpin: 0, duration: 0.5 });
            }
        }, "-=0.6");

        tl.to([...body.map(b=>b.rotation)], {
            x: "-=0.5",
            duration: 1.2,
            ease: "power2.inOut"
        }, "<");

        tl.to([rightArm.rotation, leftArm.rotation], {
            x: "-=0.45",
            duration: 2,
            ease: "back.out"
        }, "<");

        tl.to([rightArm.position, leftArm.position], {
            y: "+=0.35",
            z: "+=0.25",
            duration: 2,
            ease: "back.out"
        }, "<");



        tl.call(onSceneComplete, null, "-=2");

        this.timeline = tl;
    },

    
    // ============================================================
    // 2. PER-FRAME UPDATE (Procedural motion)
    // ============================================================

    update(delta, context) {
        if (!this.state) return;

        const { wheels, neck, eyes, lenses, body, wheelSpin, roach } = this.state;

        wheels.forEach(w => {
            if (w) w.rotation.x += wheelSpin * delta;
        });

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
        if (this.timeline) this.timeline.kill();
        this.state = null;
    }
};