import Conf from '../config/conf.json';
import SceneRepository from './SceneRepository';
import TexasHoldemSceneFactory from '../factory/game/TexasHoldemSceneFactory';

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
      TexasHoldemSceneFactory.generateWithPromise({id: Conf.data.player.id, stack: 5000}, {id: 22, stack: 5000}, 50)
        .then(sceneObject => {
          SceneRepository.setGameObject(game);
          SceneRepository.pushScene(sceneObject.getScene())
        });
    };
    game.start();
    gameObject = game;
  }
}
