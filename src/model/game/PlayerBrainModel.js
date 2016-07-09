import Player from './Player';
import ActionModel from './ActionModel';
import {ALLIN, RAISE, CALL, CHECK, FOLD} from '../const/ActionName';

export default class PlayerBrain {
  constructor(player) {
    this.player = player;
    this.action = null;
  }

  getPlayer() {
    return this.player;
  }

  decideAction(actionPhase, enemyBrain, board, callValue) {}

  setPlayer(player) {
    this.player = player;
  }

  setAction(name, value) {
    this.action = new ActionModel(name, value);
  }

  getAction() {
    return this.action;
  }

  resetAction() {
    this.action = null;
  }

  printAction() {
    //console.log('id:' + this.player.id + 'のアクションは' + this.action.name + '。賭け金は' + this.action.value);
  }

}
