import Player from './Player';
import PlayerBrain from './PlayerBrain';
import ActionModel from './ActionModel';
import {ALLIN, RAISE, CALL, CHECK, FOLD} from '../const/ActionName';

export default class AnyHandCallManBrain extends PlayerBrain {
  constructor(player) {
    super(player);
  }

  // override
  decideAction(actionPhase, enemyBrain, board, callValue) {
    if (this.action === null) {
      this.action = new ActionModel(CHECK, 0);
    } else if (this.action.value === callValue) {
      this.action = new ActionModel(CHECK, callValue);
    } else {
      this.action = new ActionModel(CALL, callValue);
    }

    if (this.action.value >= this.player.getStack()) {
      this.action = new ActionModel(ALLIN, this.player.getStack());
    }
  }
}