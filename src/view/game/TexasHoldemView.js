import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/game/sprites.json';
import SpriteFactory from '../../factory/SpriteFactory';
import ImageRepository from '../../repository/ImageRepository';
import * as BaseAction from '../../const/BaseAction';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';

export default class TexasHoldemView extends BaseView {
  initializeTexasHoldemView(players, initialBlind) {
    return this.initialize(SpritesConf.images).then(()=>{
      this.players = players;
      this.bigBlind = initialBlind;
      this.playerId = Conf.data.player.id;
      this.labels = [];
      this.boardCardSprites = [];
      this.handCards = {};
      this.betChipSprites = [];
      this.betValue = 0;
      this.callValue = initialBlind;
      return Promise.resolve();
    }).then(()=>{
      return this.setSpritePlaces(players, initialBlind);
    }).then(()=>{
      return this.initializeSpriteEvents()
    });
  }

  getCurrentBetValue() {
    return this.betValue;
  }

  // TODO: できればベースクラスのメソッドにしたいやつ
  getLabels() {
    return Object.keys(this.labels).map(key => this.labels[key]);
  }

  setSpritePlaces(players, initialBlind) {
    return new Promise((resolve, reject) => {
      const playersNum = players.length;
      const interval = Math.round(360 / playersNum);
      const shortRadius = Math.round(this.sprites['poker_table'].height / 2);
      const longRadius = Math.round(this.sprites['poker_table'].width / 2);
      const centerX = this.sprites['poker_table'].x + longRadius;
      const centerY = this.sprites['poker_table'].y + shortRadius;
      for (let index = 0; index < playersNum; index++) {
        let xPlace, yPlace;
        const player = players[index];
        const cardSprite = SpriteFactory.getClone(this.sprites['player_card']);
        const angle = (90 + interval * index) % 360;
        xPlace = centerX + longRadius * Math.cos(angle * Math.PI / 180);
        if (xPlace < centerX) {
          xPlace -= cardSprite.width;
        }
        yPlace = centerY + shortRadius * Math.sin(angle * Math.PI / 180);
        if (yPlace < centerY) {
          yPlace -= cardSprite.height;
        }
        this.sprites['player_card_' + player.id] = cardSprite;
        this.sprites['player_card_' + player.id].x = xPlace;
        this.sprites['player_card_' + player.id].y = yPlace;
        this.visibleSpriteKeys.push('player_card_' + player.id);
        this.sprites['player_bet_chip_' + player.id] = SpriteFactory.getClone(this.sprites['chip']);
        this.sprites['player_bet_chip_' + player.id].x = centerX + 0.9 * longRadius * Math.cos(angle * Math.PI / 180);
        this.sprites['player_bet_chip_' + player.id].y = centerY + 0.9 * shortRadius * Math.sin(angle * Math.PI / 180);
        this.labels['player_name_' + player.id] = new Label('ID：' + player.id);
        this.labels['player_name_' + player.id].moveTo(xPlace, yPlace);
        this.labels['player_stack_' + player.id] = new Label('残り：' + player.getStack());
        this.labels['player_stack_' + player.id].moveTo(xPlace, yPlace + cardSprite.height / 2);
        this.labels['player_bet_chip_' + player.id] = new Label('');
        this.labels['player_bet_chip_' + player.id].moveTo(
          centerX + 0.7 * longRadius * Math.cos((angle+10) * Math.PI / 180),
          centerY + 0.7 * shortRadius * Math.sin((angle+10) * Math.PI / 180)
        );
        this.labels['pot_value'] = new Label('合計掛け金：' + 0);
        this.labels['pot_value'].moveTo(centerX - 0.5 * longRadius, centerY - 0.5 * shortRadius);
      }
      this.labels['bet_value'] = new Label('0 Bet');
      this.labels['bet_value'].moveTo(
        this.sprites['bet_bar'].x + this.sprites['bet_bar'].width / 2,
        this.sprites['bet_bar'].y + this.sprites['bet_bar'].height + Conf.main.height * 0.02
      );
      resolve();
    });
  }

  initializeSpriteEvents() {
    return new Promise((resolve, reject) => {
      this.sprites['bet_slider'].addEventListener('touchmove', (event) => {
        const minX = this.sprites['bet_bar'].x;
        const maxX = minX + this.sprites['bet_bar'].width;
        this.sprites['bet_slider'].x = event.x;
        if (this.sprites['bet_slider'].x < minX) {
          this.sprites['bet_slider'].x = minX;
        } else if(this.sprites['bet_slider'].x > maxX) {
          this.sprites['bet_slider'].x = maxX;
        }
        const betValue = Math.round(this.players[this.playerId].getStack() * (this.sprites['bet_slider'].x - minX) / (maxX - minX));
        this.labels['bet_value'].text = betValue + ' Bet';
      });
      this.sprites['raise'].addEventListener('touchend', () => {
        const minX = this.sprites['bet_bar'].x;
        const maxX = minX + this.sprites['bet_bar'].width;
        const betValue = Math.round(this.players[this.playerId].getStack() * (this.sprites['bet_slider'].x - minX) / (maxX - minX));
        if (betValue < 2 * this.callValue || betValue < this.betValue) {
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
      resolve();
    });
  }

  // ディーラーポジションを決める描画
  decidePositionDraw(bigBlindIndex, callValue) {
    const sprites = [];
    const playersNum = this.players.length;
    this.callValue = callValue;
    let deelerIndex, smallBlindIndex, bigBlindId, smallBlindId, bigBlindAction, smallBlindAction, bigBlindStack, smallBlindStack;
    if (playersNum > 2) {
      smallBlindIndex = (bigBlindIndex + playersNum - 1) % playersNum;
      deelerIndex = (bigBlindIndex + playersNum - 2) % playersNum;
    } else {
      smallBlindIndex = (bigBlindIndex + playersNum - 1) % playersNum;
      deelerIndex = smallBlindIndex;
    }
    bigBlindId = this.players[bigBlindIndex].id;
    bigBlindAction = this.players[bigBlindIndex].getAction();
    bigBlindStack = this.players[bigBlindIndex].getStack();
    smallBlindId = this.players[smallBlindIndex].id;
    smallBlindAction = this.players[smallBlindIndex].getAction();
    smallBlindStack = this.players[smallBlindIndex].getStack();
    this.labels['player_stack_' + bigBlindId].text = '残り：' + (bigBlindStack - bigBlindAction.value);
    this.labels['player_bet_chip_' + bigBlindId].text = bigBlindAction.name + '：' + bigBlindAction.value;
    this.labels['player_stack_' + smallBlindId].text = '残り：' + (smallBlindStack - smallBlindAction.value);
    this.labels['player_bet_chip_' + smallBlindId].text = smallBlindAction.name + '：' + smallBlindAction.value;

    const interval = Math.round(360 / playersNum);
    const shortRadius = Math.round(this.sprites['poker_table'].height / 2);
    const longRadius = Math.round(this.sprites['poker_table'].width / 2);
    const centerX = this.sprites['poker_table'].x + longRadius;
    const centerY = this.sprites['poker_table'].y + shortRadius;
    const angle = (90 + interval * deelerIndex) % 360;
    this.sprites['deeler_button'].x = centerX + 0.9 * longRadius * Math.cos((angle + interval / 4)  * Math.PI / 180);
    this.sprites['deeler_button'].y = centerY + 0.9 * shortRadius * Math.sin((angle + interval / 4) * Math.PI / 180);
    this.betChipSprites.push(this.sprites['player_bet_chip_' + bigBlindId]);
    this.betChipSprites.push(this.sprites['player_bet_chip_' + smallBlindId]);
    sprites.push(this.sprites['player_bet_chip_' + bigBlindId]);
    sprites.push(this.sprites['player_bet_chip_' + smallBlindId]);
    return sprites;
  }

  // ボードにカードをオープンする描画
  setCardsDraw(cards) {
    const cardSprites = [];
    const startX = this.sprites['poker_table'].x + 0.25 * Conf.main.width;
    const startY = this.sprites['poker_table'].y + 0.14 * Conf.main.height;
    const interval = 0.03 * Conf.main.width;
    cards.forEach(card => {
      const cardSprite = this.sprites['card_trump/' + card.getCardImageName()];
      cardSprite.x = startX + (this.boardCardSprites.length - 1) * (cardSprite.width + interval);
      cardSprite.y = startY;
      cardSprites.push(cardSprite);
      this.boardCardSprites.push(cardSprite)
    });
    return cardSprites;
  }

  // カード配る部分の描画
  dealCardsDraw() {
    const cardSprites = [];
    this.players.forEach(player => {
      const cards = player.getCards();
      for (let index = 0; index < cards.length; index++) {
        let sprite;
        if (player.id === this.playerId) {
          sprite = this.sprites['card_trump/' + cards[index].getCardImageName()];
        } else {
          sprite = SpriteFactory.getClone(this.sprites['card_trump/z01.png']);
        }
        sprite.x = this.sprites['player_card_' + player.id].x + index * sprite.width;
        sprite.y = this.sprites['player_card_' + player.id].y;
        this.handCards['player_id_' + player.id + '_num' + index] = sprite;
        cardSprites.push(sprite);
      }
    });
    return cardSprites;
  }

  actionDraw(id, action) {
    const sprites = [];
    this.players.forEach(player => {
      if (player.id === id) {
        const restStack = player.getStack() - action.value;
        this.labels['player_stack_' + id].text = '残り：' + restStack;
        if (action.value > 0) {
          const chipSprite = this.sprites['player_bet_chip_' + id];
          this.labels['player_bet_chip_' + id].text = action.name + '：' + action.value;
          if (false === this.betChipSprites.some(sprite => sprite === chipSprite)) {
            this.betChipSprites.push(chipSprite);
            sprites.push(chipSprite);
          }
        } else {
          this.labels['player_bet_chip_' + id].text = action.name;
        }
      }
    });
    return sprites;
  }

  potDraw(potValue) {
    this.labels['pot_value'].text = '合計賭けチップ：' + potValue;
    return [];
  }

  foldDraw(id) {
    const cardSprites = [];
    cardSprites.push(this.handCards['player_id_' + id + '_num0']);
    cardSprites.push(this.handCards['player_id_' + id + '_num1']);
    delete this.handCards['player_id_' + id + '_num0'];
    delete this.handCards['player_id_' + id + '_num1'];
    return cardSprites;
  }

  showDown() {
    this.players.forEach(player => {
      const cards = player.getCards();
      if (player.id !== this.playerId && cards.length === 2) {
        this.handCards['player_id_' + player.id + '_num0'].image = ImageRepository.getImage('trump/' + cards[0].getCardImageName());
        this.handCards['player_id_' + player.id + '_num1'].image = ImageRepository.getImage('trump/' + cards[1].getCardImageName());
      }
    });
  }

  shareChips() {
    this.labels['pot_value'].text = '合計賭けチップ：' + 0;
    this.players.forEach(player => {
      this.labels['player_stack_' + player.id].text = '残り：' + player.getStack();
      this.labels['player_bet_chip_' + player.id].text = '';
    });
  }

  actionDrawErase() {
    this.players.forEach(player => {
      this.labels['player_stack_' + player.id].text = '残り：' + player.getStack();
      this.labels['player_bet_chip_' + player.id].text = '';
    });
    return this.betChipSprites;
  }

  setCallValue(callValue) {
    if (callValue > this.callValue) {
      this.callValue = callValue;
    }
  }

  resetOneAction() {
    this.currentAction = BaseAction.ACTION_NONE;
    this.sprites['bet_slider'].x = this.sprites['bet_bar'].x;
    this.labels['bet_value'].text = '0 Bet';
  }

  resetOnePhase() {
    this.currentAction = BaseAction.ACTION_NONE;
    this.betChipSprites = [];
    this.betValue = 0;
    this.callValue = 0;
  }

  resetOneGame() {
    this.boardCardSprites = [];
    this.handCards = {};
  }
}
