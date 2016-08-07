import TexasHoldemScene from '../../scene/game/TexasHoldemScene';
import PlayerModel from '../../model/game/PlayerModel';
//import AnyHandCallPlayerModel from '../../model/game/AnyHandCallPlayerModel';
import MachineLearnPlayerModel from '../../model/game/MachineLearnPlayerModel';

export default class TexasHoldemSceneFactory {
  static generateWithPromise(playerData, enemyData, initialBlind) {
    return Promise.resolve(new TexasHoldemScene()).then(scene => {
      return scene.initializeTexasHoldemScene(
        [new PlayerModel(playerData.id, playerData.stack, 0), new MachineLearnPlayerModel(enemyData.id, enemyData.stack, 1)],
        initialBlind
      );
    });
  }
}
