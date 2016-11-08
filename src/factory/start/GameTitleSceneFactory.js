import GameTitleScene from '../../scene/start/GameTitleScene';

export default class GameTitleSceneFactory {
  static async generateWithPromise() {
    const gameTitleScene = new GameTitleScene();
    await gameTitleScene.initializeGameTitleScene();
    return gameTitleScene;
  }
}
