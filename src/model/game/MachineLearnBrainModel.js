import PlayerBrain from './AiPlayerModel';
import PokerLearnModel from './learn/PokerLearnModel';

export default class MachineLearnPlayerModel extends AiPlayerModel {
  constructor(id, stack) {
    super(id, stack);
    this.pokerLearnModel = new PokerLearnModel(this.stack);
  }

  // override
  decideAction(actionPhase, enemyPlayerModel, boardModel, callValue) {
    this.action = this.pokerLearnModel.getAction(actionPhase, this, enemyPlayerModel, boardModel, callValue);
  }

  learn(chip, isLoose) {
    this.pokerLearnModel.updateQValues(chip, isLoose);
    this.pokerLearnModel.deleteHistories();
  }

  learnWhenFold(actionPhase, chip, isLoose) {
    this.pokerLearnModel.updateQValue(actionPhase, chip, isLoose);
    this.pokerLearnModel.deleteHistories();
  }
}
