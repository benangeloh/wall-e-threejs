import * as THREE from 'three';
import gsap from 'gsap';

export default {
    start(context, onSceneComplete) {
        const { camera, models } = context;

        console.log("Scene 2 Started");

        camera.position.set(-10, 2, 5); 
        camera.lookAt(0, 2, 5);

        const tl = gsap.timeline({ onComplete: onSceneComplete });

        tl.to(models.wallE.scene.position, {
            z: 15,
            duration: 5,
            ease: "linear",
            onUpdate: () => {
                camera.lookAt(models.wallE.scene.position);
            }
        });
    },

    update(delta, context) {},
    end(context) {}
};