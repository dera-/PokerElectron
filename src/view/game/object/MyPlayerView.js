import PlayerView from './PlayerView';
import * as BaseAction from '../../const/BaseAction';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';

export default class MyPlayerView extends PlayerView {
  initializeElements(elements) {
    super.initializeElements(elements).then(() => {
      this.betValue = 0;
      this.callValue = elements.initial_blind;
      this.currentAction = TexasHoldemAction.ACTION_NONE;
      this.sprites['bet_slider'].x = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
      this.labels['bet_value'].moveTo(
        this.sprites['bet_bar'].x + 0.4 * this.sprites['bet_bar'].width,
        this.sprites['fold'].y + 0.5 * this.sprites['fold'].height
      );
      this.labels['bet_value'].font = '20px sans-serif';
      return Promise.resolve();
    });
  }

  registerEntityEvent() {
    this.sprites['bet_slider'].addEventListener('touchmove', event => {
      this.moveBetSlider(event);
    });
    this.sprites['bet_bar'].addEventListener('touchstart', event =>{
      this.moveBetSlider(event);
    });
    this.sprites['raise'].addEventListener('touchend', () => {
      const minX = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
      const maxX = minX + this.sprites['bet_bar'].width;
      const betValue = Math.round(player.getStack() * (this.sprites['bet_slider'].x - minX) / (maxX - minX));
      if (betValue === player.getStack()) {
        this.betValue = betValue;
        this.currentAction = TexasHoldemAction.ACTION_ALLIN;
        return;
      }
      if (betValue < this.bigBlind || betValue < 2 * this.callValue || betValue < this.betValue) {
        return ;
      }
      this.betValue = betValue;
      this.currentAction = TexasHoldemAction.ACTION_RAISE;
    });
    this.sprites['call'].addEventListener('touchend', () => {
      this.betValue = this.callValue;
      this.currentAction = TexasHoldemAction.ACTION_CALL;
    });
    this.sprites['fold'].addEventListener('touchend', () => {
      this.currentAction = TexasHoldemAction.ACTION_FOLD;
    });
  }

  moveBetSlider(event) {
    const minX = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
    const maxX = minX + this.sprites['bet_bar'].width;
    this.sprites['bet_slider'].x = event.x - this.sprites['bet_slider'].width / 2;
    if (this.sprites['bet_slider'].x < minX) {
      this.sprites['bet_slider'].x = minX;
    } else if(this.sprites['bet_slider'].x > maxX) {
      this.sprites['bet_slider'].x = maxX;
    }
    const betValue = Math.round(this.getPlayer().getStack() * (this.sprites['bet_slider'].x - minX) / (maxX - minX));
    this.labels['bet_value'].text = betValue + ' Bet';
  }

  getCurrentBetValue() {
    return this.betValue;
  }

  setCallValue(callValue) {
    if (callValue > this.callValue) {
      this.callValue = callValue;
    }
  }

  setPlayerBetValue() {
    const playerAction = this.player.getAction();
    if (playerAction !== null) {
      this.betValue = playerAction.value;
    }
  }

  resetAction() {
    this.currentAction = TexasHoldemAction.ACTION_NONE;
    this.sprites['bet_slider'].x = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
    this.labels['bet_value'].text = '0 Bet';
  }

  resetOnePhase() {
    this.currentAction = TexasHoldemAction.ACTION_NONE;
    this.betValue = 0;
    this.callValue = 0;
  }
}
