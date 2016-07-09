import PlayerBrain from './PlayerBrain';
import PokerLearnModel from './learn/PokerLearnModel';

export default class MachineLearnBrain extends PlayerBrain {
  constructor(player) {
    super(player);
    this.pokerLearnModel = new PokerLearnModel(player.getStack());
  }

  // override
  decideAction(actionPhase, enemyBrain, board, callValue) {
    this.action = this.pokerLearnModel.getAction(actionPhase, this, enemyBrain, board, callValue);
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
