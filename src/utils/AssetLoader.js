import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const AssetLoader = {
    loadAll: async () => {
        const loader = new GLTFLoader();
        
        const loadModel = (url) => new Promise((resolve) => {
            loader.load(url, (gltf) => resolve(gltf));
        });

        const [boatData, wallEData, roachData, trashPileData, floorData, cubeData, braData,wallEKeyData, buildAData, buildBData, buildCData, waterPumpData, carData, glassData, cliffData] = await Promise.all([
            loadModel('./models/lcvp_higgins_boat_1945.glb'),
            loadModel('./models/wall-e.glb'),
            loadModel('./models/roach.glb'),
            loadModel('./models/background/pile_metal.glb'),
            loadModel('./models/landscape/wasteland_floor.glb'),
            loadModel('./models/scrap_cube.glb'),
            loadModel('./models/props/bra.glb'),
            loadModel('./models/wall_e_keys.glb'),
            loadModel('./models/background/abandoned_building.glb'),       
            loadModel('./models/background/abandoned_brick_building.glb'),
            loadModel('./models/background/war_damaged_building_2.glb'),
            loadModel('./models/background/water_tower_water_tanker_14_mb.glb'),
            loadModel('./models/background/abandoned_car_near_yellow_cat_mine_utah.glb'),
            loadModel('./models/background/shattered_glass.glb'),   
            loadModel('./models/background/cliff0003.glb'),
        ]);

        return {
            boat: { scene: boatData.scene, animations: boatData.animations },
            wallE: { scene: wallEData.scene, animations: wallEData.animations },
            roach: { scene: roachData.scene, animations: roachData.animations },
            trashPile: { scene: trashPileData.scene, animations: trashPileData.animations },
            floor: { scene: floorData.scene, animations: floorData.animations },
            trashCube: { scene: cubeData.scene, animations: cubeData.animations },
            bra: { scene: braData.scene, animations: braData.animations },
            wallEKey: { scene: wallEKeyData.scene, animations: wallEKeyData.animations },
            buildingHigh: { scene: buildAData.scene, animations: buildAData.animations },
            buildingBrick: { scene: buildBData.scene, animations: buildBData.animations },
            buildingStore: { scene: buildCData.scene, animations: buildCData.animations },
            waterPump: { scene: waterPumpData.scene, animations: waterPumpData.animations },
            car: { scene: carData.scene, animations: carData.animations },
            glass: { scene: glassData.scene, animations: glassData.animations },
            dirt: { scene: cliffData.scene, animations: cliffData.animations },
        };
    }
};