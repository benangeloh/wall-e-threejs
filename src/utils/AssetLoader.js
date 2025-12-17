import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const AssetLoader = {
    loadAll: async () => {
        const loader = new GLTFLoader();
        
        // promise loader
        const loadModel = (url) => new Promise((resolve) => {
            loader.load(url, (gltf) => resolve(gltf));
        });

        const [boatData, wallEData, roachData, trashPileData, floorData, cubeData, braData, wallEKeyData] = await Promise.all([
            loadModel('./models/lcvp_higgins_boat_1945.glb'),
            loadModel('./models/wall-e.glb'),
            loadModel('./models/roach.glb'),
            loadModel('./models/background/pile_metal.glb'),
            loadModel('./models/landscape/wasteland_floor.glb'),
            loadModel('./models/scrap_cube.glb'),
            loadModel('./models/props/bra.glb'),
            loadModel('./models/wall_e_keys.glb')
        ]);

        return {
            boat: { scene: boatData.scene, animations: boatData.animations },
            bra: { scene: braData.scene, animations: braData.animations },
            wallEKey: { scene: wallEKeyData.scene, animations: wallEKeyData.animations },
            wallE: { scene: wallEData.scene, animations: wallEData.animations },
            roach: { scene: roachData.scene, animations: roachData.animations },
            trashPile: { scene: trashPileData.scene, animations: trashPileData.animations },
            floor: { scene: floorData.scene, animations: floorData.animations },
            trashCube: { scene: cubeData.scene, animations: cubeData.animations },
        };
    }
};