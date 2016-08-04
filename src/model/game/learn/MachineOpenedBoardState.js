import MachineState from './MachineState';
import {ALL_REAL_RANK_STRENGTH} from '../../../const/game/RankStrength';
import {ALL_BOARD_PATTERNS} from '../../../const/game/learn/BoardType';
import {ALL_ACTIONS} from '../../../const/game/TexasHoldemAction';
import RankUtil from '../../../util/game/RankUtil';
import BoardUtil from '../../../util/game/learn/BoardUtil';

export default class MachineOpenedBoardState extends MachineState {
  constructor(id, rank, isFlushDraw, isStraightDraw, boardType, enemyAction) {
    super(id);
    this.rank = rank;
    this.isFlushDraw = isFlushDraw;
    this.isStraightDraw = isStraightDraw;
    this.boardType = boardType;
    this.enemyAction = enemyAction;
  }

  static generateAllStates() {
    let states = [],
      id = 1;
    for (let rank of ALL_REAL_RANK_STRENGTH) {
      for (let boardType of ALL_BOARD_PATTERNS) {
            for (let enemyAction of ALL_ACTIONS) {
              states.push(new MachineOpenedBoardState(id, rank, true, true, boardType, enemyAction));
              states.push(new MachineOpenedBoardState(id + 1, rank, true, false, boardType, enemyAction));
              states.push(new MachineOpenedBoardState(id + 2, rank, false, true, boardType, enemyAction));
              states.push(new MachineOpenedBoardState(id + 3, rank, false, false, boardType, enemyAction));
              id += 4;
            }
      }
    }
    return states;
  }

  static getId(myHand, boardCards, myStack, enemyStack, myAction, enemyAction) {
    let sortedMyHand = myHand.sort((card1, card2) => card1.number - card2.number),
      rank = RankUtil.getRealRank(myHand, boardCards),
      isFlushDraw = RankUtil.isFlushDraw(myHand, boardCards),
      isStraightDraw = RankUtil.isStraightDraw(myHand, boardCards),
      boardType = BoardUtil.getBoardType(boardCards),
      searched = ALL_STATES.filter((state) => {
        return rank === state.rank && isFlushDraw === state.isFlushDraw && isStraightDraw === state.isStraightDraw && boardType === state.boardType && enemyAction === state.enemyAction;
      });
    if (searched.length === 0) {
      console.log(sortedMyHand);
      console.log(boardCards);
      console.log('rank:'+rank);
      console.log('フラドロ:'+isFlushDraw);
      console.log('ストドロ:'+isStraightDraw);
      console.log('ボード:'+boardType);
      throw new Error('状態IDが見つかりませんでした');
    }
    return searched[0].id;
  }

  static getStatesCount() {
    return ALL_STATES.length;
  }
}

const ALL_STATES = MachineOpenedBoardState.generateAllStates();
