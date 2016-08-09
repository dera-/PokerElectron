import TexasHoldemScene from '../../scene/game/TexasHoldemScene';
import PlayerModel from '../../model/game/PlayerModel';
//import AnyHandCallPlayerModel from '../../model/game/AnyHandCallPlayerModel';
import MachineLearnPlayerModel from '../../model/game/MachineLearnPlayerModel';
import CharacterConfig from '../../config/data/character.json';
import StageConfig from '../../config/data/stage.json';

export default class TexasHoldemSceneFactory {
  static generateWithPromise(playerData, enemyData, initialBlind) {
    return Promise.resolve(new TexasHoldemScene()).then(scene => {
      return scene.initializeTexasHoldemScene(
        [
          new PlayerModel(playerData.id, playerData.stack, 0, CharacterConfig.data.you),
          new MachineLearnPlayerModel(enemyData.id, enemyData.stack, 1, CharacterConfig.data.ai)
        ],
        initialBlind,
        StageConfig.data.casino
      );
    });
  }
}
