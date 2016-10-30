import {ACTION_ALLIN, ACTION_RERAISE, ACTION_RAISE, ACTION_CALL, ACTION_CHECK, ACTION_FOLD, ACTION_NONE} from '../../const/game/TexasHoldemAction';

export default class ActionModel {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  getActionNameForEnemy(myActionName) {
    let actionName = this.name;
    if (actionName === ACTION_ALLIN) {
      actionName = ACTION_RAISE;
    }
    if (actionName === ACTION_FOLD) {
      return ACTION_NONE
    } else if (actionName === ACTION_CHECK) {
      return ACTION_CALL;
    } else if (myActionName === ACTION_RAISE && actionName === ACTION_RAISE) {
      return ACTION_RERAISE;
    }
    return actionName;
  }
}