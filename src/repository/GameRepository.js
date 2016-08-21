import Conf from '../config/conf.json';
import SceneRepository from './SceneRepository';
import GameTitleSceneFactory from '../factory/start/GameTitleSceneFactory';
import PlayerModelRepository from '../repository/game/PlayerModelRepository';
import LoadingScene from '../scene/LoadingScene';

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
      new Promise((resolve, reject) => {
        SceneRepository.setGameObject(game);
        const loadingScene = new LoadingScene();
        resolve(loadingScene.initializeLoadingScene());
      }).then(sceneObject => {
        SceneRepository.pushScene(sceneObject.getScene());
        return Promise.resolve(GameTitleSceneFactory.generateWithPromise());
      }).then(sceneObject => {
        PlayerModelRepository.register('ai');
        PlayerModelRepository.register('kyouka');
        SceneRepository.pushScene(sceneObject.getScene());
        return Promise.resolve();
      });
    };
    game.start();
    gameObject = game;
  }
}
