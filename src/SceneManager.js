export class SceneManager {
    constructor(context) {
        this.context = context; 
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
        if (this.currentScene && this.currentScene.end) {
            this.currentScene.end(this.context);
        }

        this.currentSceneIndex++;

        if (this.currentSceneIndex >= this.scenes.length) {
            return;
        }

        this.currentScene = this.scenes[this.currentSceneIndex];
        console.log(`Action: Scene ${this.currentSceneIndex + 1}`);
        
        this.currentScene.start(this.context, () => this.next());
    }

    update(delta) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(delta, this.context);
        }
    }

    togglePause(isPaused) {
        if (this.currentScene && this.currentScene.timeline) {
            if (isPaused) {
                this.currentScene.timeline.pause();
            } else {
                this.currentScene.timeline.resume();
            }
        }
    }
}