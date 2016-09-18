import * as StackSize from '../../../const/game/learn/StackSizeType';

const THRESHOLD = 2;
const BIG_THRESHOLD = 5;

export default class StackUtil {
  static getStackSizeType(myStack, enemyStack) {
    if (myStack >= BIG_THRESHOLD * enemyStack) {
      return StackSize.VERY_LARGE;
    } else if (myStack >= THRESHOLD * enemyStack) {
      return StackSize.LARGE;
    } else if (enemyStack < THRESHOLD * myStack) {
      return StackSize.EVEN;
    } else if (enemyStack < BIG_THRESHOLD * myStack) {
      return StackSize.SHORT;
    } else {
      return StackSize.VERY_SHORT;
    }
  }
}
