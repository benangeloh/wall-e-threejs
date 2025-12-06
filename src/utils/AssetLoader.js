import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const AssetLoader = {
    loadAll: async () => {
        const loader = new GLTFLoader();
        
        // promise loader
        const loadModel = (url) => new Promise((resolve) => {
            loader.load(url, (gltf) => resolve(gltf));
        });

        const [boatData, wallEData, roachData] = await Promise.all([
            loadModel('./models/lcvp_higgins_boat_1945.glb'),
            loadModel('./models/wall-e.glb'),
            loadModel('./models/roach.glb')
        ]);

        return {
            boat: { scene: boatData.scene, animations: boatData.animations },
            wallE: { scene: wallEData.scene, animations: wallEData.animations },
            roach: { scene: roachData.scene, animations: roachData.animations }
        };
    }
};