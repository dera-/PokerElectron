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

const REWARD = 10;
const PENALTY = -10;

export default class PokerLearnModel {
  constructor(initialStack, useFile = false) {
    let qValueFactory = new QValueFactory();
    this.initialStack = initialStack;
    if (useFile) {
      // this.preFlopQValueMap = qValueFactory.generateMapByCsv(FileUtil.getContent('preFlopQValues.csv'));
      // this.flopQValueMap = qValueFactory.generateMapByCsv(FileUtil.getContent('flopQValues.csv'));
      // this.turnQValueMap = qValueFactory.generateMapByCsv(FileUtil.getContent('turnQValues.csv'));
      // this.riverQValueMap = qValueFactory.generateMapByCsv(FileUtil.getContent('riverQValues.csv'));
    } else {
      console.log('preflop_init');
      this.preFlopQValueMap = qValueFactory.generateMapForPreFlopState();
      console.log('flop_init');
      this.flopQValueMap = qValueFactory.generateMapForOpenedBoardState();
      console.log('turn_init');
      this.turnQValueMap = qValueFactory.generateMapForOpenedBoardState();
      console.log('river_init');
      this.riverQValueMap = qValueFactory.generateMapForOpenedBoardState();
    }
    this.preFlopActionHistory = [];
    this.flopActionHistory = [];
    this.turnActionHistory = [];
    this.riverActionHistory = [];
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
      //console.log(qValue);
      if (nextQValue === null) {
        qValue.updatedScore(value, 0);
      } else {
        qValue.updatedScore(0, nextQValue.getScore());
      }
      nextQValue = qValue;
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
      machineAction;
    switch(actionPhase) {
      case PHASE_PRE_FLOP:
        stateId = MachinePreFlopState.getId(myHand, myStack, enemyStack, myActionName, enemyActionName);
        qvalues = this.preFlopQValueMap.get(stateId);
        qvalue = this.getQValue(qvalues, callValue, ActionUtil.getNoBetValue(myAction));
        this.preFlopActionHistory.unshift(qvalue);
        break;
      case PHASE_FLOP:
        stateId = MachineOpenedBoardState.getId(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        qvalues = this.flopQValueMap.get(stateId);
        qvalue = this.getQValue(qvalues, callValue, ActionUtil.getNoBetValue(myAction));
        this.flopActionHistory.unshift(qvalue)
        break;
      case PHASE_TURN:
        stateId = MachineOpenedBoardState.getId(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        qvalues = this.turnQValueMap.get(stateId);
        qvalue = this.getQValue(qvalues, callValue, ActionUtil.getNoBetValue(myAction));
        this.turnActionHistory.unshift(qvalue);
        break;
      case PHASE_RIVER:
        stateId = MachineOpenedBoardState.getId(myHand, boardCards, myStack, enemyStack, myActionName, enemyActionName);
        qvalues = this.riverQValueMap.get(stateId);
        qvalue = this.getQValue(qvalues, callValue, ActionUtil.getNoBetValue(myAction));
        this.riverActionHistory.unshift(qvalue);
        break;
    }
    console.log(qvalue);
    machineAction = MachineAction.getMachineAction(qvalue.actionId);
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
      return new ActionModel(ACTION_CALL, callValue);
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
      if (callValue === 0) {
        isPossibleAction = qvalue.actionId !== CALL_NUM;
      } else {
        isPossibleAction = qvalue.actionId !== CHECK_NUM;
      }
      if (callValue === currentBetValue) {
        isPossibleAction = isPossibleAction && qvalue.actionId !== FOLD_NUM
      }
      return isPossibleAction;
    }),
      probabilities = this.getQValueProbabilities(candidates),
      random = Math.random(),
      before = 0;
    for (let i=0; i < probabilities.length; i++) {
      if (before <= random && random < before + probabilities[i]) {
        return candidates[i];
      } else {
        before += probabilities[i];
      }
    }
    return null;
  }

  getQValueProbabilities(qvalues) {
    let probabilities = [],
      temp = 0.20,  //逆温度(0に近い程グリーディ)
      all = 0;
    //expを全部足した値を導く
    for (let qvalue of qvalues) {
      all += Math.exp(qvalue.getScore() / temp); //逆温度を使用
    }
    //全て足し合わせた値が0ならば選ばれる確率は皆均等にする
    if (all === 0) {
      for(let i=0; i < qvalues.length; i++){
        probabilities.push(1.0 / qvalues.length);
      }
    } else {
      for (let qvalue of qvalues) {
        probabilities.push(Math.exp(qvalue.getScore() / temp) / all);  //逆温度を使用
      }
    }
    return probabilities;
  }

  saveQvaluesData() {
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