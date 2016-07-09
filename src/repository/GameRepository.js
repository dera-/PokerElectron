let gameObject = null;
export default class GameRepository {
  static get() {
    if (gameObject === null) {
      GameRepository.initialize();
    }
    return gameObject;
  }

  static initialize() {
    const game = new Game(320, 320);
    game.onload = function () {
      //game.preload(GameConfig.MAP_CHIPS_IMAGE_PATH);
      // TODO 初期化処理
      console.log('hello world');
    };
    game.start();
    gameObject = game;
  }
}
