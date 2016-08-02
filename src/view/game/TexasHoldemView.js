import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/game/sprites.json';
import SpriteFactory from '../../factory/SpriteFactory';
import ImageRepository from '../../repository/ImageRepository';
import * as BaseAction from '../../const/BaseAction';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import SceneRepository from '../../repository/SceneRepository';

export default class TexasHoldemView extends BaseView {
  initializeTexasHoldemView(players, initialBlind) {
    return this.initialize(SpritesConf.images).then(()=>{
      this.players = players;
      this.bigBlind = initialBlind;
      this.playerId = Conf.data.player.id;
      this.labels = [];
      this.boardCardSprites = {};
      this.handCards = {};
      this.betChipSprites = {};
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
        yPlace = centerY + 0.95 * shortRadius * Math.sin(angle * Math.PI / 180);
        if (yPlace < centerY) {
          yPlace -= cardSprite.height;
        }
        this.sprites['bet_slider'].x = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2
        this.sprites['player_card_' + player.id] = cardSprite;
        this.sprites['player_card_' + player.id].x = xPlace;
        this.sprites['player_card_' + player.id].y = yPlace;
        this.visibleSpriteKeys.push('player_card_' + player.id);
        this.sprites['player_bet_chip_' + player.id] = SpriteFactory.getClone(this.sprites['chip']);
        this.sprites['player_bet_chip_' + player.id].x = centerX + 0.9 * longRadius * Math.cos(angle * Math.PI / 180);
        this.sprites['player_bet_chip_' + player.id].y = centerY + 0.9 * shortRadius * Math.sin(angle * Math.PI / 180);
        if (centerY < this.sprites['player_bet_chip_' + player.id].y) {
          this.sprites['player_bet_chip_' + player.id].y -= this.sprites['player_bet_chip_' + player.id].height;
        }
        this.labels['player_name_' + player.id] = new Label('ID：' + player.id);
        this.labels['player_name_' + player.id].moveTo(xPlace + 0.05 * cardSprite.width, yPlace + 0.1 * cardSprite.height);
        this.labels['player_name_' + player.id].font = '16px sans-serif';
        this.labels['player_stack_' + player.id] = new Label('残り：' + player.getStack());
        this.labels['player_stack_' + player.id].moveTo(xPlace + 0.05 * cardSprite.width, yPlace + 0.6 * cardSprite.height);
        this.labels['player_stack_' + player.id].font = '16px sans-serif';
        this.labels['player_bet_chip_value_' + player.id] = new Label('');
        this.labels['player_bet_chip_value_' + player.id].moveTo(
          centerX + 0.7 * longRadius * Math.cos((angle+10) * Math.PI / 180),
          centerY + 0.7 * shortRadius * Math.sin((angle+10) * Math.PI / 180)
        );
        this.labels['player_bet_chip_value_' + player.id].color = 'white';
        this.labels['player_bet_chip_value_' + player.id].font = '14px sans-serif';
        this.labels['pot_value'] = new Label('合計掛け金：' + 0);
        this.labels['pot_value'].moveTo(centerX - 0.5 * longRadius, centerY - 0.5 * shortRadius);
        this.labels['pot_value'].color = 'white';
        this.labels['pot_value'].font = '24px sans-serif';
      }
      this.labels['bet_value'] = new Label('0 Bet');
      this.labels['bet_value'].moveTo(
        this.sprites['bet_bar'].x + 0.4 * this.sprites['bet_bar'].width,
        this.sprites['fold'].y + 0.5 * this.sprites['fold'].height
      );
      this.labels['bet_value'].font = '20px sans-serif';
      resolve();
    });
  }

  initializeSpriteEvents() {
    return new Promise((resolve, reject) => {
      this.sprites['bet_slider'].addEventListener('touchmove', event => {
        this.moveBetSlider(event);
      });
      this.sprites['bet_bar'].addEventListener('touchstart', event =>{
        this.moveBetSlider(event);
      });
      this.sprites['raise'].addEventListener('touchend', () => {
        const minX = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
        const maxX = minX + this.sprites['bet_bar'].width;
        const betValue = Math.round(this.getPlayer().getStack() * (this.sprites['bet_slider'].x - minX) / (maxX - minX));
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
      resolve();
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

    // TODO: できればベースクラスのメソッドにしたいやつ
  labelsDraw() {
    Object.keys(this.labels).forEach(key => {
      SceneRepository.addEntityToCurrentScene(key, this.labels[key]);
    });
  }

  // ディーラーポジションを決める描画
  decidePositionDraw(bigBlindIndex, callValue) {
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
    console.log("view_bigBlindIndex:"+bigBlindIndex);
    console.log("view_smallBlindIndex:"+smallBlindIndex);
    console.log("view_deelerIndex:"+deelerIndex);
    bigBlindId = this.players[bigBlindIndex].id;
    bigBlindAction = this.players[bigBlindIndex].getAction();
    bigBlindStack = this.players[bigBlindIndex].getStack();
    smallBlindId = this.players[smallBlindIndex].id;
    smallBlindAction = this.players[smallBlindIndex].getAction();
    smallBlindStack = this.players[smallBlindIndex].getStack();
    this.labels['player_stack_' + bigBlindId].text = '残り：' + (bigBlindStack - bigBlindAction.value);
    this.labels['player_bet_chip_value_' + bigBlindId].text = bigBlindAction.name + '：' + bigBlindAction.value;
    this.labels['player_stack_' + smallBlindId].text = '残り：' + (smallBlindStack - smallBlindAction.value);
    this.labels['player_bet_chip_value_' + smallBlindId].text = smallBlindAction.name + '：' + smallBlindAction.value;

    const interval = Math.round(360 / playersNum);
    const shortRadius = Math.round(this.sprites['poker_table'].height / 2);
    const longRadius = Math.round(this.sprites['poker_table'].width / 2);
    const centerX = this.sprites['poker_table'].x + longRadius;
    const centerY = this.sprites['poker_table'].y + shortRadius;
    const angle = (90 + interval * deelerIndex) % 360;
    this.sprites['deeler_button'].x = centerX + 0.9 * longRadius * Math.cos((angle + interval / 10)  * Math.PI / 180);
    this.sprites['deeler_button'].y = centerY + 0.9 * shortRadius * Math.sin((angle + interval / 10) * Math.PI / 180);
    this.betChipSprites['player_bet_chip_' + bigBlindId] = this.sprites['player_bet_chip_' + bigBlindId];
    this.betChipSprites['player_bet_chip_' + smallBlindId] = this.sprites['player_bet_chip_' + smallBlindId];
    SceneRepository.addEntityToCurrentScene('player_bet_chip_' + bigBlindId, this.sprites['player_bet_chip_' + bigBlindId]);
    SceneRepository.addEntityToCurrentScene('player_bet_chip_' + smallBlindId, this.sprites['player_bet_chip_' + smallBlindId]);
  }

  // ボードにカードをオープンする描画
  setCardsDraw(cards) {
    const startX = this.sprites['poker_table'].x + 0.25 * Conf.main.width;
    const startY = this.sprites['poker_table'].y + 0.14 * Conf.main.height;
    const interval = 0.03 * Conf.main.width;
    cards.forEach(card => {
      const cardSprite = this.sprites['card_trump/' + card.getCardImageName()];
      const cardNums = Object.keys(this.boardCardSprites).length;
      cardSprite.x = startX + (cardNums - 1) * (cardSprite.width + interval);
      cardSprite.y = startY;
      this.boardCardSprites['board_cards_' + cardNums] = cardSprite;
      SceneRepository.addEntityToCurrentScene('board_cards_' + cardNums, cardSprite);
    });
  }

  // カード配る部分の描画
  dealCardsDraw() {
    this.players.forEach(player => {
      const cards = player.getCards();
      for (let index = 0; index < cards.length; index++) {
        let sprite;
        if (player.id === this.playerId) {
          sprite = this.sprites['card_trump/' + cards[index].getCardImageName()];
        } else {
          sprite = SpriteFactory.getClone(this.sprites['card_trump/z01.png']);
        }
        sprite.x = this.sprites['player_card_' + player.id].x + this.sprites['player_card_' + player.id].width + (index - 2) * sprite.width;
        sprite.y = this.sprites['player_card_' + player.id].y;
        this.handCards['player_id_' + player.id + '_num' + index] = sprite;
        SceneRepository.addEntityToCurrentScene('player_id_' + player.id + '_num' + index, sprite);
      }
    });
  }

  actionDraw(id, action) {
    this.players.forEach(player => {
      if (player.id === id) {
        const restStack = player.getStack() - action.value;
        this.labels['player_stack_' + id].text = '残り：' + restStack;
        if (action.value > 0) {
          const chipSpriteKey = 'player_bet_chip_' + id;
          const chipSprite = this.sprites[chipSpriteKey];
          this.labels['player_bet_chip_value_' + id].text = action.name + '：' + action.value;
          if (false === Object.keys(this.betChipSprites).some(key => key === chipSpriteKey)) {
            this.betChipSprites[chipSpriteKey] = chipSprite;
            SceneRepository.addEntityToCurrentScene(chipSpriteKey, chipSprite);
          }
        } else {
          this.labels['player_bet_chip_value_' + id].text = action.name;
        }
      }
    });
  }

  potDraw(potValue) {
    this.labels['pot_value'].text = '合計賭けチップ：' + potValue;
  }

  foldDraw(id) {
    SceneRepository.removeEntityFromCurrentScene('player_id_' + id + '_num0');
    SceneRepository.removeEntityFromCurrentScene('player_id_' + id + '_num1');
    delete this.handCards['player_id_' + id + '_num0'];
    delete this.handCards['player_id_' + id + '_num1'];
  }

  showDownDraw() {
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
      this.labels['player_bet_chip_value_' + player.id].text = '';
    });
  }

  actionDrawErase() {
    this.players.forEach(player => {
      this.labels['player_stack_' + player.id].text = '残り：' + player.getStack();
      this.labels['player_bet_chip_value_' + player.id].text = '';
    });
    Object.keys(this.betChipSprites).forEach(key => {
      SceneRepository.removeEntityFromCurrentScene(key);
    });
  }

  oneGameDrawErase() {
    Object.keys(this.boardCardSprites).forEach(key => {
      SceneRepository.removeEntityFromCurrentScene(key);
    });
    Object.keys(this.handCards).forEach(key => {
      SceneRepository.removeEntityFromCurrentScene(key);
    });
  }

  setCallValue(callValue) {
    if (callValue > this.callValue) {
      this.callValue = callValue;
    }
  }

  setPlayerBetValue() {
    const playerAction = this.getPlayer().getAction();
    if (playerAction !== null) {
      this.betValue = playerAction.value;
    }
  }

  getPlayer() {
    const players = this.players.filter(player => player.id === this.playerId);
    return players[0];
  }

  resetOneAction() {
    this.currentAction = BaseAction.ACTION_NONE;
    this.sprites['bet_slider'].x = this.sprites['bet_bar'].x - this.sprites['bet_slider'].width / 2;
    this.labels['bet_value'].text = '0 Bet';
  }

  resetOnePhase() {
    this.currentAction = BaseAction.ACTION_NONE;
    this.betChipSprites = {};
    this.betValue = 0;
    this.callValue = 0;
  }

  resetOneGame() {
    this.boardCardSprites = {};
    this.handCards = {};
  }
}
