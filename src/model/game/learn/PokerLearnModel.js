import QValue from './QValue';
import MachinePreFlopState from './MachinePreFlopState';
import MachineOpenedBoardState from './MachineOpenedBoardState';
import MachineRiverState from './MachineRiverState';
import MachineAction from './MachineAction';
import QValueFactory from '../../../factory/game/learn/QValueFactory';
import {PHASE_PRE_FLOP, PHASE_FLOP, PHASE_TURN, PHASE_RIVER} from '../../../const/game/TexasHoldemPhase';
import {ACTION_ALLIN, ACTION_RAISE, ACTION_CALL, ACTION_CHECK, ACTION_FOLD, ACTION_NONE} from '../../../const/game/TexasHoldemAction';
import {BIG_RAISE_NUM, MIDDLE_RAISE_NUM, SMALL_RAISE_NUM, CALL_NUM, CHECK_NUM, FOLD_NUM} from '../../../const/game/learn/MachineActionNumber';
import ActionModel from '../ActionModel';
import ActionUtil from '../../../util/game/learn/ActionUtil';
import QValueUtil from '../../../util/game/learn/QValueUtil';
import CardModel from '../CardModel';
import * as CardSuit from '../../../const/game/CardSuit';
import FileAccess from '../../../process/FileAccess';

const REWARD = 10;
const PENALTY = -10;

export default class PokerLearnModel {
  constructor(initialStack, dataFilePrefix = '') {
    this.initialStack = initialStack;
    this.dataFilePrefix = dataFilePrefix;
    this.preFlopQValueMap = this.getQValueMap(PHASE_PRE_FLOP, FileAccess.readData(dataFilePrefix + 'pre_flop.csv').split('\n'));
    this.flopQValueMap = this.getQValueMap(PHASE_FLOP, FileAccess.readData(dataFilePrefix + 'flop.csv').split('\n'));
    this.turnQValueMap = this.getQValueMap(PHASE_TURN, FileAccess.readData(dataFilePrefix + 'turn.csv').split('\n'));
    this.riverQValueMap = this.getQValueMap(PHASE_RIVER, FileAccess.readData(dataFilePrefix + 'river.csv').split('\n'));
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

  setQValueMaps(data) {
    this.preFlopQValueMap = this.getQValueMap(PHASE_PRE_FLOP, data.pre_flop.split("\n"));
    this.flopQValueMap = this.getQValueMap(PHASE_FLOP, data.flop.split("\n"));
    this.turnQValueMap = this.getQValueMap(PHASE_TURN, data.turn.split("\n"));
    this.riverQValueMap = this.getQValueMap(PHASE_RIVER, data.river.split("\n"));
  }

  getQValueMap(phase, data) {
    const qValueFactory = new QValueFactory(phase);
    if (data.length <= 1) {
      return qValueFactory.generateInitialMap();
    } else {
      return qValueFactory.generateMapByCsv(data);
    }
  }

  setInitialStack(initialStack) {
    this.initialStack = initialStack;
  }

  updateQValues(chip, isLoose) {
    let value = this.getResultValue(chip, isLoose),
      lambdaValue = QValue.getLambdaValue(),
      valueForTurn = value * Math.pow(lambdaValue, this.riverActionHistory.length),
      valueForFrop = value * Math.pow(lambdaValue, this.riverActionHistory.length + this.turnActionHistory.length),
      valueForPreFlop = value * Math.pow(lambdaValue, this.riverActionHistory.length + this.turnActionHistory.length + this.flopActionHistory.length);
    this.updateQValuesForOnePhase(value, this.riverActionHistory);
    this.updateQValuesForOnePhase(valueForTurn, this.turnActionHistory);
    this.updateQValuesForOnePhase(valueForFrop, this.flopActionHistory);
    this.updateQValuesForOnePhase(valueForPreFlop, this.preFlopActionHistory);
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
    //console.log('initialStack:'+this.initialStack);
    //console.log('result:'+(result * chip / this.initialStack));
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
      enemyActionName = enemyAction === null ? ACTION_NONE : enemyAction.getActionNameForEnemy(myActionName),
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
        stateId = MachineRiverState.getId(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        similarStateIds = MachineRiverState.getSimilarIds(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        currrentMap = this.riverQValueMap;
        qvalues = this.riverQValueMap.get(stateId);
        qvalue = this.getQValue(qvalues, callValue, ActionUtil.getNoBetValue(myAction));
        this.riverActionHistory.unshift(qvalue);
        break;
    }
    //console.log('Q値:' + qvalue);
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
    // console.log('machineAction:'+machineAction.id);
    // console.log('actionPhase:'+actionPhase);
    // console.log('potValue:'+potValue);
    // console.log('callValue:'+callValue);
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
    for (let i=0; i < probabilities.length; i++) {
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
    this.writeMapData(this.preFlopQValueMap, this.dataFilePrefix + 'pre_flop.csv');
    this.writeMapData(this.flopQValueMap, this.dataFilePrefix + 'flop.csv');
    this.writeMapData(this.turnQValueMap, this.dataFilePrefix + 'turn.csv');
    this.writeMapData(this.riverQValueMap, this.dataFilePrefix + 'river.csv');
  }

  writeMapData(map, filePath) {
    let data = '';
    for (let values of map.values()) {
      values.forEach(value => {
        data += value.getCsvData() + '\n';
      });
    }
    FileAccess.writeDataAsync(data, filePath);
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
    const MAX_THRESHOLD = 100000000;
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
    const actionRate = {big_raise: 0, middle_raise:0, small_raise:0, raise: 0, call: 0, check: 0, fold: 0};
    let total = 0;
    Object.keys(actionValues).forEach(key => {
      total += actionValues[key];
      if (key == BIG_RAISE_NUM) {
        actionRate.raise += actionValues[key];
        actionRate.big_raise += actionValues[key];
      } else if (key == MIDDLE_RAISE_NUM) {
        actionRate.raise += actionValues[key];
        actionRate.middle_raise += actionValues[key];
      } else if (key == SMALL_RAISE_NUM) {
        actionRate.raise += actionValues[key];
        actionRate.small_raise += actionValues[key];
      } else if (key == CALL_NUM) {
        actionRate.call += actionValues[key];
      } else if (key == CHECK_NUM) {
        actionRate.check += actionValues[key];
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
}
