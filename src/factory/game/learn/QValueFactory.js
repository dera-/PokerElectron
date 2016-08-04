import QValue from '../../../model/game/learn/QValue';
import MachineAction from '../../../model/game/learn/MachineAction';
import MachineOpenedBoardState from '../../../model/game/learn/MachineOpenedBoardState';
import MachinePreFlopState from '../../../model/game/learn/MachinePreFlopState';
const MapForEs6 = Map

export default class QvalueFactory {
  generateMapForPreFlopState() {
    return this.generateMap(MachinePreFlopState.getStatesCount(), MachineAction.getActionsCount());
  }

  generateMapForOpenedBoardState() {
    return this.generateMap(MachineOpenedBoardState.getStatesCount(), MachineAction.getActionsCount());
  }

  generateMap(statesCount, actionsCount) {
    const qValueMap = new MapForEs6();
    for (let stateId = 1; stateId <= statesCount; stateId++) {
      let qValues = [];
      for (let actionId = 1; actionId <= actionsCount; actionId++) {
        qValues.push(new QValue(stateId, actionId));
      }
      qValueMap.set(stateId, qValues);
    }
    return qValueMap;
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
