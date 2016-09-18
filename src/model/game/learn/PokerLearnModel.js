import QValue from './QValue';
import MachinePreFlopState from './MachinePreFlopState';
import MachineOpenedBoardState from './MachineOpenedBoardState';
import MachineAction from './MachineAction';
import QValueFactory from '../../../factory/game/learn/QValueFactory';
import {PHASE_PRE_FLOP, PHASE_FLOP, PHASE_TURN, PHASE_RIVER} from '../../../const/game/TexasHoldemPhase';
import {ACTION_ALLIN, ACTION_RAISE, ACTION_CALL, ACTION_CHECK, ACTION_FOLD, ACTION_NONE} from '../../../const/game/TexasHoldemAction';
import {ALLIN_NUM, BIG_RAISE_NUM, MIDDLE_RAISE_NUM, SMALL_RAISE_NUM, CALL_NUM, CHECK_NUM, FOLD_NUM} from '../../../const/game/learn/MachineActionNumber';
import ActionModel from '../ActionModel';
import ActionUtil from '../../../util/game/learn/ActionUtil';
import QValueUtil from '../../../util/game/learn/QValueUtil';
import CardModel from '../CardModel';
import * as CardSuit from '../../../const/game/CardSuit';

const REWARD = 10;
const PENALTY = -10;

export default class PokerLearnModel {
  constructor(initialStack, dataFilePrefix = '') {
    let qValueFactory = new QValueFactory();
    this.initialStack = initialStack;
    if (dataFilePrefix !== '') {
      const preFlopQValuesData = require("raw!../../../data/" + dataFilePrefix + "PreFlopQValues.txt").split('\n');
      const flopQValuesData = require("raw!../../../data/" + dataFilePrefix + "FlopQValues.txt").split('\n');
      this.preFlopQValueMap = qValueFactory.generateMapByCsv(preFlopQValuesData);
      this.flopQValueMap = qValueFactory.generateMapByCsv(flopQValuesData);
      this.turnQValueMap = qValueFactory.generateMapByCsv(flopQValuesData);
      this.riverQValueMap = qValueFactory.generateMapByCsv(flopQValuesData);
    } else {
      this.preFlopQValueMap = qValueFactory.generateMapForPreFlopState();
      this.flopQValueMap = qValueFactory.generateMapForOpenedBoardState();
      this.turnQValueMap = qValueFactory.generateMapForOpenedBoardState();
      this.riverQValueMap = qValueFactory.generateMapForOpenedBoardState();
    }
    this.preFlopActionHistory = [];
    this.flopActionHistory = [];
    this.turnActionHistory = [];
    this.riverActionHistory = [];
    this.currentSimilarQValues = [];

    this.bestPreFlopState = null;
    this.preFlopActionValues = {};
    this.flopActionValues = {};
    this.turnActionValues = {};
    this.riverActionValues = {};
  }

  updateQValues(chip, isLoose) {
    let value = this.getResultValue(chip, isLoose),
      lambdaValue = QValue.getLambdaValue(),
      valueForTurn = value * Math.pow(lambdaValue, this.riverActionHistory.length),
      valueForFrop = value * Math.pow(lambdaValue, this.riverActionHistory.length + this.turnActionHistory.length),
      valueForPreFlop = value * Math.pow(lambdaValue, this.riverActionHistory.length + this.turnActionHistory.length + this.flopActionHistory.length);
    this.updateQValuesForOnePhase(value, this.riverActionHistory);
    this.updateQValuesForOnePhase(value, this.turnActionHistory);
    this.updateQValuesForOnePhase(value, this.flopActionHistory);
    this.updateQValuesForOnePhase(value, this.preFlopActionHistory);
  }

  updateQValue(actionPhase, chip, isLoose) {
    let value = this.getResultValue(chip, isLoose);
    switch(actionPhase) {
      case PHASE_PRE_FLOP:
        this.updateQValuesForOnePhase(value, this.preFlopActionHistory);
        break;
      case PHASE_FLOP:
        this.updateQValuesForOnePhase(value, this.flopActionHistory);
        break;
      case PHASE_TURN:
        this.updateQValuesForOnePhase(value, this.turnActionHistory);
        break;
      case PHASE_RIVER:
        this.updateQValuesForOnePhase(value, this.riverActionHistory);
        break;
    }
  }

  updateQValuesForOnePhase(value, history) {
    let nextQValue = null;
    history.forEach((qValue) => {
      if (nextQValue === null) {
        qValue.updatedScore(value, 0);
      } else {
        qValue.updatedScore(0, nextQValue.getScore());
      }
      nextQValue = qValue;
    });
  }

  updateCurrentSimilarQValues(reward) {
    this.currentSimilarQValues.forEach((qValue) => {
      qValue.updatedScore(reward, 0);
    });
  }

  getResultValue(chip, isLoose) {
    let result = isLoose ? PENALTY : REWARD;
    return result * chip / this.initialStack;
  }

  deleteHistories() {
    this.preFlopActionHistory = [];
    this.flopActionHistory = [];
    this.turnActionHistory = [];
    this.riverActionHistory = [];
  }

  getAction(actionPhase, player, enemy, board, callValue) {
    let myAction = player.getAction(),
      enemyAction = enemy.getAction(),
      myHand = player.getCards(),
      myStack = player.getStack(),
      enemyStack = enemy.getStack(),
      myActionName = myAction === null ? ACTION_NONE : myAction.name,
      enemyActionName = enemyAction === null ? ACTION_NONE : enemyAction.name,
      boardCards = board.getOpenedCards(),
      stateId,
      qvalues,
      qvalue,
      machineAction,
      similarStateIds,
      currrentMap;
    switch(actionPhase) {
      case PHASE_PRE_FLOP:
        stateId = MachinePreFlopState.getId(myHand, myStack, enemyStack, myActionName, enemyActionName);
        similarStateIds = MachinePreFlopState.getSimilarIds(myHand, myStack, enemyStack, myActionName, enemyActionName);
        currrentMap = this.preFlopQValueMap;
        qvalues = this.preFlopQValueMap.get(stateId);
        qvalue = this.getQValue(qvalues, callValue, ActionUtil.getNoBetValue(myAction));
        this.preFlopActionHistory.unshift(qvalue);
        break;
      case PHASE_FLOP:
        stateId = MachineOpenedBoardState.getId(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        similarStateIds = MachineOpenedBoardState.getSimilarIds(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        currrentMap = this.flopQValueMap;
        qvalues = this.flopQValueMap.get(stateId);
        qvalue = this.getQValue(qvalues, callValue, ActionUtil.getNoBetValue(myAction));
        this.flopActionHistory.unshift(qvalue)
        break;
      case PHASE_TURN:
        stateId = MachineOpenedBoardState.getId(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        similarStateIds = MachineOpenedBoardState.getSimilarIds(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        currrentMap = this.turnQValueMap;
        qvalues = this.turnQValueMap.get(stateId);
        qvalue = this.getQValue(qvalues, callValue, ActionUtil.getNoBetValue(myAction));
        this.turnActionHistory.unshift(qvalue);
        break;
      case PHASE_RIVER:
        stateId = MachineOpenedBoardState.getId(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        similarStateIds = MachineOpenedBoardState.getSimilarIds(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        currrentMap = this.riverQValueMap;
        qvalues = this.riverQValueMap.get(stateId);
        qvalue = this.getQValue(qvalues, callValue, ActionUtil.getNoBetValue(myAction));
        this.riverActionHistory.unshift(qvalue);
        break;
    }
    console.log(qvalue);
    machineAction = MachineAction.getMachineAction(qvalue.actionId);
    // 類似QValueの取得
    this.currentSimilarQValues = [];
    similarStateIds.forEach(id => {
      const targetQValue = currrentMap.get(id).filter(q => q.actionId === qvalue.actionId);
      this.currentSimilarQValues.push(targetQValue[0]);
    });
    return this.getActualAction(machineAction, actionPhase, board.getPotValue(), callValue, player);
  }

  getActualAction(machineAction, actionPhase, potValue, callValue, player) {
    let myAction = player.getAction(),
      betValue = 0;
    if (machineAction.id === FOLD_NUM) {
      return new ActionModel(ACTION_FOLD, ActionUtil.getNoBetValue(myAction));
    } else if (machineAction.id === CHECK_NUM) {
      return new ActionModel(ACTION_CHECK, ActionUtil.getNoBetValue(myAction));
    } else if (machineAction.id === CALL_NUM) {
      if (callValue >= player.getStack()) {
        return new ActionModel(ACTION_ALLIN, player.getStack());
      } else {
        return new ActionModel(ACTION_CALL, callValue);
      }
    } else if (machineAction.id === ALLIN_NUM) {
      return new ActionModel(ACTION_ALLIN, player.getStack());
    }
    betValue = ActionUtil.getMachineBetValue(machineAction.id, potValue, callValue);
    if (betValue >= player.getStack()) {
      return new ActionModel(ACTION_ALLIN, player.getStack());
    } else {
      return new ActionModel(ACTION_RAISE, betValue);
    }
  }

  getQValue(qvalues, callValue, currentBetValue) {
    let candidates = qvalues.filter((qvalue) => {
      let isPossibleAction;
      if (callValue === currentBetValue) {
        isPossibleAction = qvalue.actionId !== CALL_NUM && qvalue.actionId !== FOLD_NUM;
      } else {
        isPossibleAction = qvalue.actionId !== CHECK_NUM;
      }
      return isPossibleAction;
    }),
      probabilities = QValueUtil.getQValueProbabilities(candidates),
      random = Math.random(),
      before = 0;
    for (let i = 0; i < probabilities.length; i++) {
      if (before <= random && random < before + probabilities[i]) {
        return candidates[i];
      } else {
        before += probabilities[i];
      }
    }
    // 多分、randomが限りなく1に近い値になった時、ここにたどり着く
    return candidates[probabilities.length-1];
  }

  saveQvaluesData() {
  }

  getBestPreFlopStateId() {
    let maxValue = 0,
      bestStateId = null;
    for (let key of this.preFlopQValueMap.keys()) {
      let qValues = this.preFlopQValueMap.get(key),
        currentValue = 0;
      qValues.forEach(qvalue => {
        if (qvalue.actionId === FOLD_NUM) {
          currentValue += qvalue.score;
        }
      });
      if (bestStateId === null || currentValue > maxValue) {
        maxValue = currentValue;
        bestStateId = key;
      }
    }
    return bestStateId;
  }

  setBestPreFlopStateId() {
    const stateId = this.getBestPreFlopStateId();
    this.bestPreFlopState = MachinePreFlopState.getState(stateId);
  }

  getFavoriteHand() {
    const hand = [];
    let suit = CardSuit.SPADE;
    hand.push(new CardModel(this.bestPreFlopState.handTop, suit));
    if (this.bestPreFlopState.isSuited) {
      suit = CardSuit.HEART;
    }
    hand.push(new CardModel(this.bestPreFlopState.handBottom, suit));
    return hand;
  }

  getActionValues(map) {
    const values = {};
    const MAX_THRESHOLD = 10000000;
    values[ALLIN_NUM] = 0;
    values[BIG_RAISE_NUM] = 0;
    values[MIDDLE_RAISE_NUM] = 0;
    values[SMALL_RAISE_NUM] = 0;
    values[CALL_NUM] = 0;
    values[CHECK_NUM] = 0;
    values[FOLD_NUM] = 0;
    for (let qvalues of map.values()) {
      qvalues.forEach(qvalue => {
        if (values[qvalue.actionId] >= MAX_THRESHOLD) {
          values[qvalue.actionId] = MAX_THRESHOLD;
        } else {
          values[qvalue.actionId] += QValueUtil.getRealScore(qvalue.score) / 10000000;
        }
      });
    }
    return values;
  }

  setActionValues() {
    this.preFlopActionValues = this.getActionValues(this.preFlopQValueMap);
    this.flopActionValues = this.getActionValues(this.flopQValueMap);
    this.turnActionValues = this.getActionValues(this.turnQValueMap);
    this.riverActionValues = this.getActionValues(this.riverQValueMap);
  }

  getActionRate(actionValues) {
    const actionRate = {raise: 0, call: 0, fold: 0};
    let total = 0;
    console.log('action_values:');
    console.log(actionValues);
    Object.keys(actionValues).forEach(key => {
      console.log(key);
      total += actionValues[key];
      if (key == ALLIN_NUM || key == BIG_RAISE_NUM || key == MIDDLE_RAISE_NUM || key == SMALL_RAISE_NUM) {
        actionRate.raise += actionValues[key];
      } else if (key == CALL_NUM || key == CHECK_NUM) {
        actionRate.call += actionValues[key];
      } else if (key == FOLD_NUM) {
        actionRate.fold += actionValues[key];
      }
    });
    Object.keys(actionRate).forEach(key => {
      actionRate[key] = actionRate[key] / total;
    });
    return actionRate;
  }

  getActionRates() {
    return {
      preflop: this.getActionRate(this.preFlopActionValues),
      flop: this.getActionRate(this.flopActionValues),
      turn: this.getActionRate(this.turnActionValues),
      river: this.getActionRate(this.riverActionValues)
    };
  }

  // writeQValueCsvDatas(map, fileName) {
  //   const write_stream = fs.createWriteStream(fileName);

  //   for (let values of map.values()) {
  //     values.forEach(value => {
  //       write_stream.write(value.getCsvData() + "\n");
  //     });
  //   }
  //   write_stream.end();
  // }
}
