import MachineState from './MachineState';
import {ALL_ACTIONS} from '../../../const/game/TexasHoldemAction';
import {ALL_STACK_SIZE_TYPE} from '../../../const/game/learn/StackSize';
import StackUtil from '../../../util/game/learn/StackUtil';

export default class MachinePreFlopState extends MachineState {
  constructor(id, handTop, handBottom, isSuited, enemyAction, stackSizeType) {
    super(id);
    this.handTop = handTop;
    this.handBottom = handBottom;
    this.isSuited = isSuited;
    this.enemyAction = enemyAction;
    this.stackSizeType = stackSizeType;
  }

  static generateAllStates() {
    let states = [],
      cardPairs = [],
      id = 1;
    for (let topNum = 14; topNum >= 2; topNum--) {
      for (let bottomNum = topNum; bottomNum >= 2; bottomNum--) {
        cardPairs.push({top:topNum, bottom:bottomNum});
      }
    }
    cardPairs.forEach((pair) => {
      for (let stackSizeType of ALL_STACK_SIZE_TYPE) {
        for (let enemyAction of ALL_ACTIONS) {
          states.push(new MachinePreFlopState(id, pair.top, pair.bottom, true, enemyAction, stackSizeType));
          states.push(new MachinePreFlopState(id + 1, pair.top, pair.bottom, false, enemyAction, stackSizeType));
          id += 2;
        }
      }
    });
    return states;
  }

  static getId(myHand, myStack, enemyStack, myAction, enemyAction) {
    let sortedMyHand = myHand.sort((card1, card2) => card1.number - card2.number),
      isSuited = sortedMyHand[0].suit === sortedMyHand[1].suit,
      stackSizeType = StackUtil.getStackSizeType(myStack, enemyStack),
      searched = PRE_FLOP_STATES.filter((state) => {
        return sortedMyHand[0].number === state.handBottom && sortedMyHand[1].number === state.handTop && isSuited === state.isSuited && enemyAction === state.enemyAction && stackSizeType === state.stackSizeType;
      });
    if (searched.length === 0) {
      throw new Error('状態IDが見つかりませんでした');
    }
    return searched[0].id;
  }

  // 対象の状態に似たような状態の取得
  static getSimilarIds(myHand, myStack, enemyStack, myAction, enemyAction) {
    let sortedMyHand = myHand.sort((card1, card2) => card1.number - card2.number),
      stackSizeType = StackUtil.getStackSizeType(myStack, enemyStack),
      searched = PRE_FLOP_STATES.filter((state) => {
        return sortedMyHand[0].number - 1 <= state.handBottom && state.handBottom <= sortedMyHand[0].number + 1 && sortedMyHand[1].number - 1 <= state.handTop && state.handTop <= sortedMyHand[1].number + 1 && enemyAction === state.enemyAction && stackSizeType === state.stackSizeType;
      });
    if (searched.length === 0) {
      throw new Error('状態IDが見つかりませんでした');
    }
    return searched.map(state => state.id);
  }

  static getStatesCount() {
    return PRE_FLOP_STATES.length;
  }

  static getState(stateId) {
    const targetState = PRE_FLOP_STATES.filter(state => state.id === stateId);
    return targetState[0];
  }
}

const PRE_FLOP_STATES = MachinePreFlopState.generateAllStates();
