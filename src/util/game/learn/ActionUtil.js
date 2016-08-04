import {BIG_RAISE_NUM, MIDDLE_RAISE_NUM, SMALL_RAISE_NUM} from '../../../const/game/learn/MachineActionNumber';

export default class ActionUtil {
  static getNoBetValue(action) {
    return action === null ? 0 : action.value;
  }

  static getMachineBetValue(machineActionNum, potValue, callValue) {
    let bigRaiseValue,
      middleRaiseValue,
      smallRaiseValue;
    if (callValue === 0) {
      bigRaiseValue = potValue;
      middleRaiseValue = Math.round(potValue / 2);
      smallRaiseValue = Math.round(potValue / 4);
    } else {
      bigRaiseValue = 4 * callValue;
      middleRaiseValue = 3 * callValue;
      smallRaiseValue = 2 * callValue;
    }
    if (machineActionNum === BIG_RAISE_NUM) {
      return bigRaiseValue;
    } else if (machineActionNum === MIDDLE_RAISE_NUM) {
      return middleRaiseValue;
    } else if (machineActionNum === SMALL_RAISE_NUM) {
      return smallRaiseValue;
    }
    return 0;
  }
}
