export class SceneManager {
    constructor(context) {
        this.context = context; // camera, scene, models, mixers
        this.scenes = [];
        this.currentSceneIndex = -1;
        this.currentScene = null;
    }

    setScenes(sceneList) {
        this.scenes = sceneList;
    }

    start() {
        this.next();
    }

    next() {
        // 1. cleanup previous scene
        if (this.currentScene && this.currentScene.end) {
            this.currentScene.end(this.context);
        }

        this.currentSceneIndex++;

        // 3. check if sequence is over
        if (this.currentSceneIndex >= this.scenes.length) {
            return;
        }

        // 4. start new scene
        this.currentScene = this.scenes[this.currentSceneIndex];
        console.log(`Action: Scene ${this.currentSceneIndex + 1}`);
        
        // pass a callback "onComplete" so the scene knows how to trigger the next one
        this.currentScene.start(this.context, () => this.next());
    }

    update(delta) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(delta, this.context);
        }
    }
}