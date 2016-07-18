import Conf from '../config/conf.json';
import ImageRepository from './ImageRepository';

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
    game.onload = function () {
      // TODO 初期化処理
      console.log('hello world');
    };
    game.start();
    gameObject = game;
  }
}
