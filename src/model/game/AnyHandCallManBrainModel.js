import AiPlayerModel from './AiPlayerModel';
import ActionModel from './ActionModel';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';

export default class AnyHandCallPlayerModel extends AiPlayerModel {
  // override
  decideAction(actionPhase, enemyPlayerModel, boardModel, callValue) {
    if (this.action === null) {
      this.action = new ActionModel(TexasHoldemAction.ACTION_CHECK, 0);
    } else if (this.action.value === callValue) {
      this.action = new ActionModel(TexasHoldemAction.ACTION_CHECK, callValue);
    } else {
      this.action = new ActionModel(TexasHoldemAction.ACTION_CALL, callValue);
    }

    if (this.action.value >= this.stack) {
      this.action = new ActionModel(TexasHoldemAction.ACTION_ALLIN, this.stack);
    }
  }
}