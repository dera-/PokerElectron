import GameTitleScene from '../../scene/start/GameTitleScene';

export default class GameTitleSceneFactory {
  static generateWithPromise() {
    return new Promise((resolve, reject) => {
      const gameTitleScene = new GameTitleScene();
      resolve(gameTitleScene.initializeGameTitleScene())
    });
  }
}
