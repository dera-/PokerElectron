import CharacterConf from '../../config/data/character.json';
import PlayerModel from '../../model/game/PlayerModel';
import AnyHandCallPlayerModel from '../../model/game/AnyHandCallPlayerModel';
import MachineLearnPlayerModel from '../../model/game/MachineLearnPlayerModel';

export default class PlayerModelFactory {
  static generateAll() {
    return Object.keys(CharacterConf.data).map(key => PlayerModelFactory.generate(key));
  }

  static generate(key) {
    const charaData = CharacterConf.data[key];
    switch(charaData.type) {
      case 'learn':
        return new MachineLearnPlayerModel(charaData.id, 0, 0, charaData);
      case 'anyhand':
        return new AnyHandCallPlayerModel(charaData.id, 0, 0, charaData);
      default:
        return new PlayerModel(charaData.id, 0, 0, charaData);
    }
  }
}