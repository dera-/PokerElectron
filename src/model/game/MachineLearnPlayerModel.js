import AiPlayerModel from './AiPlayerModel';
import PokerLearnModel from './learn/PokerLearnModel';

export default class MachineLearnPlayerModel extends AiPlayerModel {
  constructor(id, money, seatNumber) {
    super(id, money, seatNumber);
    this.pokerLearnModel = new PokerLearnModel(money);
  }

  // override
  decideAction(actionPhase, enemy, board, callValue) {
    this.action = this.pokerLearnModel.getAction(actionPhase, this, enemy, board, callValue);
  }

  learn(chip, isLoose) {
    this.pokerLearnModel.updateQValues(chip, isLoose);
    this.pokerLearnModel.deleteHistories();
  }

  learnWhenFold(actionPhase, chip, isLoose) {
    this.pokerLearnModel.updateQValue(actionPhase, chip, isLoose);
    this.pokerLearnModel.deleteHistories();
  }

  save() {
    this.pokerLearnModel.saveQvaluesData();
  }
}
