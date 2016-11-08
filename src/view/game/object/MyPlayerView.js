import PlayerView from './PlayerView';
import * as TexasHoldemAction from '../../../const/game/TexasHoldemAction';
import ButtonView from '../../object/ButtonView';

export default class MyPlayerView extends PlayerView {
  initializeElements(elements) {
    super.initializeElements(elements).then(() => {
      this.betValue = 0;
      this.callValue = elements.initial_blind;
      this.initialBlind = elements.initial_blind;
      this.minimumRaiseValue = 2 * elements.initial_blind;
      this.currentAction = TexasHoldemAction.ACTION_NONE;
      this.sprites['bet_slider'].x = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
      return Promise.resolve();
    }).then(() => {
      return this.initializeButtonViews();
    }).then(()=>{
      return this.registerEntityEvent();
    });
  }

  initializeButtonViews() {
    return new Promise((resolve, reject) => {
      const sprites = {'fold': this.sprites['fold']};
      const labels = {'fold': new Label('フォールド')};
      this.foldButtonView = new ButtonView();
      resolve(this.foldButtonView.initialize(sprites, labels, {name: 'fold'}));
    }).then(()=>{
      const sprites = {'call': this.sprites['call']};
      const labels = {'call': new Label('チェック')};
      this.callButtonView = new ButtonView();
      return Promise.resolve(this.callButtonView.initialize(sprites, labels, {name: 'call'}));
    }).then(()=>{
      const sprites = {'raise': this.sprites['raise']};
      const labels = {'raise': new Label('レイズ 0 (不可)')};
      this.raiseButtonView = new ButtonView();
      return Promise.resolve(this.raiseButtonView.initialize(sprites, labels, {name: 'raise'}));
    }).then(()=>{
      const sprites = {'bet_up_button': this.sprites['bet_up_button']};
      this.betUpButtonView = new ButtonView();
      return Promise.resolve(this.betUpButtonView.initialize(sprites, {}, {name: 'bet_up_button'}));
    }).then(()=>{
      const sprites = {'bet_down_button': this.sprites['bet_down_button']};
      this.betDownButtonView = new ButtonView();
      return Promise.resolve(this.betDownButtonView.initialize(sprites, {}, {name: 'bet_down_button'}));
    }).then(()=>{
      this.removeSprite('fold');
      this.removeSprite('call');
      this.removeSprite('raise');
      this.removeSprite('bet_up_button');
      this.removeSprite('bet_down_button');
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
      this.raiseButtonView.getEventSprite().addEventListener('touchend', () => {
        const betValue = this.getBetValue();
        if (betValue >= this.player.getStack()) {
          this.betValue = this.player.getStack();
          this.callValue = this.betValue;
          this.currentAction = TexasHoldemAction.ACTION_ALLIN;
          return;
        }
        if (betValue < this.initialBlind || betValue < this.minimumRaiseValue || betValue < this.player.getBetValue()) {
          return ;
        }
        this.betValue = betValue;
        this.callValue = this.betValue;
        this.currentAction = TexasHoldemAction.ACTION_RAISE;
      });
      this.callButtonView.getEventSprite().addEventListener('touchend', () => {
        const currentStack = this.player.getStack();
        let action = TexasHoldemAction.ACTION_CALL;
        if (this.player.getBetValue() === this.callValue) {
          action = TexasHoldemAction.ACTION_CHECK;
        }
        if (currentStack < this.callValue) {
          this.betValue = currentStack;
        } else {
          this.betValue = this.callValue;
        }
        this.callValue = this.betValue;
        this.currentAction = action;
        console.log('コール/チェックボタン：' + this.currentAction);
      });
      this.foldButtonView.getEventSprite().addEventListener('touchend', () => {
        this.currentAction = TexasHoldemAction.ACTION_FOLD;
      });
      this.betUpButtonView.getEventSprite().addEventListener('touchstart', () => {
        this.moveBetSliderByButton(1);
      });
      this.betDownButtonView.getEventSprite().addEventListener('touchstart', () => {
        this.moveBetSliderByButton(-1);
      });
      resolve();
    });
  }

  showFirst() {
    super.showFirst();
    this.foldButtonView.showFirst();
    this.callButtonView.showFirst();
    this.raiseButtonView.showFirst();
    this.betUpButtonView.showFirst();
    this.betDownButtonView.showFirst();
  }

  moveBetSlider(event) {
    const minX = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
    const maxX = minX + this.sprites['bet_bar'].width;
    this.sprites['bet_slider'].x = event.x - this.sprites['bet_slider'].width / 2;
    this.changeBetSliderPlace(minX, maxX);
  }

  moveBetSliderByButton(num) {
    const minX = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
    const maxX = minX + this.sprites['bet_bar'].width;
    if (this.minimumRaiseValue >= this.player.getStack()) {
      this.sprites['bet_slider'].x = maxX;
    } else {
      this.sprites['bet_slider'].x = this.sprites['bet_slider'].x + num * (maxX - minX) * 0.5 * (this.minimumRaiseValue - this.callValue) / (this.player.getStack() - this.minimumRaiseValue);
    }
    this.changeBetSliderPlace(minX, maxX);
  }

  changeBetSliderPlace(minX, maxX) {
    if (this.sprites['bet_slider'].x < minX) {
      this.sprites['bet_slider'].x = minX;
    } else if(this.sprites['bet_slider'].x > maxX) {
      this.sprites['bet_slider'].x = maxX;
    }
    const betValue = this.getBetValue();
    if (betValue >= this.player.getStack()) {
      this.raiseButtonView.changeText('オールイン');
    } else if (betValue < this.initialBlind || betValue < this.minimumRaiseValue || betValue < this.player.getBetValue()) {
      this.raiseButtonView.changeText('レイズ ' + betValue + '(不可)');
    } else {
      this.raiseButtonView.changeText('レイズ ' + betValue);
    }
  }

  getBetValue() {
    const minX = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
    const maxX = minX + this.sprites['bet_bar'].width;
    const rate = (this.sprites['bet_slider'].x - minX) / (maxX - minX);
    return Math.round((this.player.getStack() - this.minimumRaiseValue) * rate + this.minimumRaiseValue);
  }

  getCurrentBetValue() {
    return this.betValue;
  }

  setCallValue(callValue) {
    const beforeCallValue = this.callValue;
    if (callValue > this.callValue) {
      this.callValue = callValue;
      this.minimumRaiseValue = 2 * callValue - beforeCallValue;
    } else if (callValue === 0) {
      this.minimumRaiseValue = this.initialBlind;
    } else {
      this.minimumRaiseValue = 2 * this.initialBlind;
    }
    let callValueText, raiseValueText;
    if (callValue >= this.player.getStack()) {
      callValueText = 'オールイン';
    } else if (callValue === 0 || callValue === this.player.getBetValue()) {
      callValueText = 'チェック';
      raiseValueText = 'レイズ ' + this.minimumRaiseValue;
    } else {
      callValueText = 'コール ' + callValue;
      raiseValueText = 'レイズ ' + this.minimumRaiseValue;
    }
    if (this.minimumRaiseValue >= this.player.getStack()) {
      this.minimumRaiseValue = this.player.getStack();
      raiseValueText = 'オールイン';
    }
    this.callButtonView.changeText(callValueText);
    this.raiseButtonView.changeText(raiseValueText);
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
    if (this.minimumRaiseValue >= this.player.getStack()) {
      this.raiseButtonView.changeText('オールイン');
    } else {
      this.raiseButtonView.changeText('レイズ ' + this.minimumRaiseValue);
    }
  }

  resetOnePhase() {
    this.currentAction = TexasHoldemAction.ACTION_NONE;
    this.betValue = 0;
    this.callValue = 0;
    this.minimumRaiseValue = this.initialBlind;
    this.raiseButtonView.changeText('レイズ 0 (不可)');
    this.callButtonView.changeText('チェック');
  }

  hidePokerHud() {
    this.foldButtonView.hideAll();
    this.callButtonView.hideAll();
    this.raiseButtonView.hideAll();
    this.betUpButtonView.hideAll();
    this.betDownButtonView.hideAll();
    this.hideSprite('bet_bar');
    this.hideSprite('bet_slider');
  }

  showPokerHud() {
    this.foldButtonView.showFirst();
    this.callButtonView.showFirst();
    this.raiseButtonView.showFirst();
    this.betUpButtonView.showFirst();
    this.betDownButtonView.showFirst();
    this.showSprite('bet_bar');
    this.showSprite('bet_slider');
  }
}
