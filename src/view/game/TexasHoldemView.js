import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/game/sprites.json';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';

export default class TexasHoldemView extends BaseView {
  constructor(players, initialBlind) {
    super(SpritesConf.images);
    this.playes = players
    this.bigBlind = initialBlind;
    this.playerId = Conf.data.player.id;
    this.boardCardSprites = [];
    this.handCards = {};
    this.labels = [];
    this.betValue = 0;
    this.callValue = 0;
    this.setSpritePlaces();
    this.initializeSpriteEvents();
  }

  setSpritePlaces(players, initialBlind) {
    const playersNum = players.length;
    const interval = Math.round(360 / playersNum);
    const shortRadius = Math.round(this.sprites['poker_table'].height / 2);
    const longRadius = Math.round(this.sprites['poker_table'].width / 2);
    const centerX = this.sprites['poker_table'].x + longRadius;
    const cenetrY = this.sprites['poker_table'].y + shortRadius;
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
        centerX + 0.85 * longRadius * Math.cos(angle * Math.PI / 180),
        centerY + 0.85 * shortRadius * Math.sin(angle * Math.PI / 180)
      );
      this.labels['pot_value'] = new Label('合計掛け金：' + 0);
      this.labels['pot_value'].moveTo(centerX - 0.5 * longRadius, centerY - 0.5 * shortRadius);
    }
    this.labels['bet_value'] = '0 Bet';
    this.labels['bet_value'].moveTo(
      this.sprites['bet_bar'].x + this.sprites['bet_bar'].width / 2,
      this.sprites['bet_bar'].y + this.sprites['bet_bar'].height + Conf.main.height * 0.02
    );
  }

  initializeSpriteEvents() {
    this.sprites['bet_slider'].addEventListener('touchmove', (event) => {
      const minX = this.sprites['bet_bar'].x;
      const maxX = minX + this.sprites['bet_bar'].width;
      this.sprites['bet_slider'].x = event.x;
      if (this.sprites['bet_slider'].x < minX) {
        this.sprites['bet_slider'].x = minX;
      } else if(this.sprites['bet_slider'].x > maxX) {
        this.sprites['bet_slider'].x = maxX;
      }
      this.labels['bet_value'].text = Math.round(this.playes[this.playerId].getStack() * (this.sprites['bet_slider'].x - minX) / minX) + ' Bet';
      this.currentAction = TexasHoldemAction.ACTION_FOLD;
    });
    this.sprites['raise'].addEventListener('touchend', () => {
      if (this.betValue >= 2 * this.callValue) {
        return ;
      }
      this.currentAction = TexasHoldemAction.ACTION_RAISE;
    });
    this.sprites['call'].addEventListener('touchend', () => {
      this.currentAction = TexasHoldemAction.ACTION_CALL;
    });
    this.sprites['fold'].addEventListener('touchend', () => {
      this.currentAction = TexasHoldemAction.ACTION_FOLD;
    });
  }

  setCardsDraw(cards) {
    const cardSprites = [];
    const startX = this.labels['poker_table'].x + 0.12 * Conf.main.width;
    const startY = this.labels['poker_table'].y + 0.25 * Conf.main.height;
    const interval = 0.03 * Conf.main.width;
    cards.forEach(card => {
      const cardSprite = this.sprites['card_' + card.getCardImageName()];
      cardSprite.x = startX + (this.boardCardSprites.length - 1) * (cardSprite.width + interval);
      cardSprite.y = startY;
      cardSprites.push(cardSprite);
      this.boardCardSprites.push(cardSprite)
    });
    return cardSprites;
  }

  dealCardsDraw() {
    const cardSprites = [];
    this.players.forEach(player => {
      const cards = player.getCards();
      for (let index = 0; index < cards.length; index++) {
        let sprite;
        if (player.id === this.playerId) {
          sprite = this.sprites['card_' + cards[index].getCardImageName()];
        } else {
          sprite = SpriteFactory.getClone(this.sprites['card_z01.png']);
        }
        this.sprites['card_' + cards[index].getCardImageName()];
        sprite.x = this.sprites['player_card_' + player.id].x + index * sprite.width;
        sprite.y = this.sprites['player_card_' + player.id].y;
        this.handCards['player_id_' + player.id + '_num' + index] = sprite;
        cardSprites.push(sprite);
      }
    });
    return cardSprites;
  }

  betDraw(id, value) {
    const chipSprites = [];
    this.players.forEach(player => {
      if (player.id === id) {
        const restStack = player.getStack() - value;
        this.labels['player_stack_' + id].text = '残り：' + restStack;
        this.labels['player_bet_chip_' + id].text = '賭けチップ：' + value;
        chipSprites.push(this.sprites['player_bet_chip_' + id]);
      }
    });
    return chipSprites;
  }

  betDrawErase() {
    const chipSprites = [];
    this.players.forEach(player => {
      if (player.id === id) {
        this.labels['player_bet_chip_' + id].text = '';
        chipSprites.push(this.sprites['player_bet_chip_' + id]);
      }
    });
    return chipSprites;
  }

  potDraw(potValue) {
    this.labels['pot'].text = '合計賭けチップ：' + potValue;
    return [];
  }

  foldDraw(id) {
    const cardSprites = [];
    this.players.forEach(player => {
      if (player.id === id) {
        const cards = player.getCards();
        cardSprites.push(this.sprites['card_' + cards[0].getCardImageName()]);
        cardSprites.push(this.sprites['card_' + cards[1].getCardImageName()]);
      }
    });
    return cardSprites;
  }

  oneGameDrawErase(){
    const chipSprites = [];
    his.labels['pot'].text = '合計賭けチップ：0';
    this.players.forEach(player => {
      this.labels['player_stack_' + player.id].text = '残り：' + player.getStack();
      this.labels['player_bet_chip_' + player.id].text = '';
      chipSprites.push(this.sprites['player_bet_chip_' + player.id]);
    });
    return chipSprites;
  }
}
