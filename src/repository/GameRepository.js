import Conf from '../config/conf.json';
import SceneRepository from './SceneRepository';
import GameTitleScene from '../scene/start/GameTitleScene';
import PlayerModelRepository from '../repository/game/PlayerModelRepository';

let gameObject = null;
export default class GameRepository {
  static get() {
    if (gameObject === null) {
      GameRepository.initialize();
    }
    return gameObject;
  }

  static initialize() {
    const game = new Game(Conf.main.width, Conf.main.height);
    game.onload =  () => {
      new Promise((resolve, reject) => {
        //試しに強化学習AI２つ投入
        PlayerModelRepository.get('ai', 5000, 0);
        PlayerModelRepository.get('kyouka', 5000, 1);
        const gameTitleScene = new GameTitleScene();
        resolve(gameTitleScene.initializeGameTitleScene())
      }).then(sceneObject => {
        SceneRepository.setGameObject(game);
        SceneRepository.pushScene(sceneObject.getScene());
        return Promise.resolve();
      });
    };
    game.start();
    gameObject = game;
  }
}
