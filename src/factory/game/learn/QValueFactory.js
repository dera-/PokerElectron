import QValue from '../../../model/game/learn/QValue';
import MachineAction from '../../../model/game/learn/MachineAction';
import MachineOpenedBoardState from '../../../model/game/learn/MachineOpenedBoardState';
import MachineRiverState from '../../../model/game/learn/MachineRiverState';
import MachinePreFlopState from '../../../model/game/learn/MachinePreFlopState';
import * as MachineActionNumber from '../../../const/game/learn/MachineActionNumber';
import * as TexasHoldemPhase from '../../../const/game/TexasHoldemPhase';
import QValueUtil from '../../../util/game/learn/QValueUtil';
const MapForEs6 = Map

export default class QvalueFactory {
  constructor(phase) {
    this.phase = phase;
  }

  generateInitialMap() {
    switch(this.phase) {
      case TexasHoldemPhase.PHASE_PRE_FLOP:
        return this.generateMap(MachinePreFlopState.getStatesCount(), MachineAction.getActionsCount());
      case TexasHoldemPhase.PHASE_FLOP:
      case TexasHoldemPhase.PHASE_TURN:
        return this.generateMap(MachineOpenedBoardState.getStatesCount(), MachineAction.getActionsCount());
      case TexasHoldemPhase.PHASE_RIVER:
        return this.generateMap(MachineRiverState.getStatesCount(), MachineAction.getActionsCount());
      default:
        return new MapForEs6();
    }
  }

  generateMap(statesCount, actionsCount) {
    const qValueMap = new MapForEs6();
    for (let stateId = 1; stateId <= statesCount; stateId++) {
      let qValues = [];
      for (let actionId = 1; actionId <= actionsCount; actionId++) {
        const score = this.getInitialScore(actionId);
        qValues.push(new QValue(stateId, actionId, score));
      }
      qValueMap.set(stateId, qValues);
    }
    return qValueMap;
  }

  getInitialScore(actionId) {
    if (actionId === MachineActionNumber.BIG_RAISE_NUM || actionId === MachineActionNumber.MIDDLE_RAISE_NUM || actionId === MachineActionNumber.SMALL_RAISE_NUM) {
      return QValueUtil.getDividedScore(0, 3);
    } else {
      return 0;
    }
  }

  generateMapByCsv(csvDatas) {
    const qValueMap = new MapForEs6();
    let currentStateId = -1,
      qValues = [];
    csvDatas.forEach(csv => {
      const qValue = this.generateByCsv(csv);
      if (currentStateId === -1) {
        currentStateId = qValue.stateId;
      } else if (currentStateId !== qValue.stateId) {
        qValueMap.set(currentStateId, qValues);
        qValues = [];
        currentStateId = qValue.stateId;
      }
      qValues.push(qValue);
    });
    return qValueMap;
  }

  generateByCsv(csvData) {
    const values = csvData.split(',');
    return new QValue(parseInt(values[0], 10), parseInt(values[1], 10), parseInt(values[2], 10));
  }
}
