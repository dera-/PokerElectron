import PlayerView from './PlayerView';
import * as TexasHoldemAction from '../../../const/game/TexasHoldemAction';
import SelectButtonView from './SelectButtonView';

export default class MyPlayerView extends PlayerView {
  initializeElements(elements) {
    super.initializeElements(elements).then(() => {
      this.betValue = 0;
      this.callValue = elements.initial_blind;
      this.currentAction = TexasHoldemAction.ACTION_NONE;
      this.sprites['bet_slider'].x = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
      return Promise.resolve();
    }).then(() => {
      return this.initializeSelectButtonViews();
    }).then(()=>{
      return this.registerEntityEvent();
    });
  }

  initializeSelectButtonViews() {
    return new Promise((resolve, reject) => {
      const sprites = {'button_fold': this.sprites['fold']};
      const labels = {'button_fold': new Label('フォールド')};
      this.foldButtonView = new SelectButtonView();
      resolve(this.foldButtonView.initialize(sprites, labels, {name: 'fold'}));
    }).then(()=>{
      const sprites = {'button_call': this.sprites['call']};
      const labels = {'button_call': new Label('チェック')};
      this.callButtonView = new SelectButtonView();
      return Promise.resolve(this.callButtonView.initialize(sprites, labels, {name: 'call'}));
    }).then(()=>{
      const sprites = {'button_raise': this.sprites['raise'], 'forbidden_raise': this.sprites['forbbiden_icon']};
      const labels = {'button_raise': new Label('レイズ 0')};
      this.raiseButtonView = new SelectButtonView();
      return Promise.resolve(this.raiseButtonView.initialize(sprites, labels, {name: 'raise'}));
    }).then(()=>{
      this.removeSprite('fold');
      this.removeSprite('call');
      this.removeSprite('raise');
      this.removeSprite('forbbiden_icon');
      return Promise.resolve();
    });
  }

  registerEntityEvent() {
    return new Promise((resolve, reject) => {
      this.sprites['bet_slider'].addEventListener('touchmove', event => {
        this.moveBetSlider(event);
      });
      this.sprites['bet_bar'].addEventListener('touchstart', event =>{
        this.moveBetSlider(event);
      });
      this.raiseButtonView.getSprite().addEventListener('touchend', () => {
        const minX = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
        const maxX = minX + this.sprites['bet_bar'].width;
        const betValue = Math.round(this.player.getStack() * (this.sprites['bet_slider'].x - minX) / (maxX - minX));
        if (betValue === this.player.getStack()) {
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
      this.callButtonView.getSprite().addEventListener('touchend', () => {
        const currentStack = this.player.getStack();
        if (currentStack < this.callValue) {
          this.betValue = currentStack;
        } else {
          this.betValue = this.callValue;
        }
        this.currentAction = TexasHoldemAction.ACTION_CALL;
      });
      this.foldButtonView.getSprite().addEventListener('touchend', () => {
        this.currentAction = TexasHoldemAction.ACTION_FOLD;
      });
      resolve();
    });
  }

  showFirst() {
    super.showFirst();
    this.foldButtonView.showFirst();
    this.callButtonView.showFirst();
    this.raiseButtonView.showFirst();
    this.raiseButtonView.showForbiddenIcon();
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
    const betValue = Math.round(this.player.getStack() * (this.sprites['bet_slider'].x - minX) / (maxX - minX));
    if (betValue === this.player.getStack()) {
      this.raiseButtonView.changeText('オールイン');
      this.raiseButtonView.hideForbiddenIcon();
    } else if (betValue < this.bigBlind || betValue < 2 * this.callValue || betValue < this.betValue) {
      this.raiseButtonView.changeText('レイズ ' + betValue);
      this.raiseButtonView.showForbiddenIcon();
    } else {
      this.raiseButtonView.changeText('レイズ ' + betValue);
      this.raiseButtonView.hideForbiddenIcon();
    }
  }

  getCurrentBetValue() {
    return this.betValue;
  }

  setCallValue(callValue) {
    if (callValue > this.callValue) {
      this.callValue = callValue;
    }
    let callValueText;
    if (callValue > this.player.getStack()) {
      callValueText = 'オールイン';
    } else if (callValue === 0 || callValue === this.betValue) {
      callValueText = 'チェック';
    } else {
      callValueText = 'コール ' + callValue;
    }
    this.callButtonView.changeText(callValueText);
  }

  setPlayerBetValue() {
    const playerAction = this.player.getAction();
    if (playerAction !== null) {
      this.betValue = playerAction.value;
    }
  }

  getCurrentAction() {
    return this.currentAction;
  }

  resetAction() {
    this.currentAction = TexasHoldemAction.ACTION_NONE;
    this.sprites['bet_slider'].x = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
    this.raiseButtonView.changeText('レイズ 0');
    this.raiseButtonView.showForbiddenIcon();
  }

  resetOnePhase() {
    this.currentAction = TexasHoldemAction.ACTION_NONE;
    this.betValue = 0;
    this.callValue = 0;
    this.raiseButtonView.changeText('レイズ 0');
    this.raiseButtonView.showForbiddenIcon();
    this.callButtonView.changeText('チェック');
  }
}
