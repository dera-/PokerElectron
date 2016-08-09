import PlayerModel from './PlayerModel';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';

export default class AiPlayerModel extends PlayerModel {
  decideAction(actionPhase, enemyPlayerModel, boardModel, callValue) {}

  fixAction(bigBlind) {
    if (this.action === null) {
      return;
    }
    if (this.action.value > this.stack) {
      // ベット額がスタックを超えていた場合
      this.action.name = TexasHoldemAction.ACTION_ALLIN;
      this.action.value = this.stack;
    } else if (this.action.name !== TexasHoldemAction.ACTION_FOLD &&
      this.action.name !== TexasHoldemAction.ACTION_CHECK &&
      this.action.value < bigBlind) {
      // ベット額がビックブラインド額を満たしていない場合
      this.action.value = bigBlind;
    }
  }
}
