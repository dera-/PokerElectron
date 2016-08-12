import Conf from '../config/conf.json';
import SceneRepository from './SceneRepository';
import GameTitleSceneFactory from '../factory/start/GameTitleSceneFactory';
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
    game.preload(Conf.data.loading.image_path);
    game.onload =  () => {
      GameTitleSceneFactory.generateWithPromise().then(sceneObject => {
        PlayerModelRepository.register('ai');
        SceneRepository.setGameObject(game);
        SceneRepository.pushScene(sceneObject.getScene());
        return Promise.resolve();
      });
    };
    game.start();
    gameObject = game;
  }
}
