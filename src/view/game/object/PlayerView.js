import ObjectView from '../../ObjectView';
import Conf from '../../../config/conf.json'
import ImageRepository from '../../../repository/ImageRepository';
import * as Position from '../../../const/game/Position';
import CharacterView from './CharacterView';
import ActionModel from '../../../model/game/ActionModel';
import * as TexasHoldemAction from '../../../const/game/TexasHoldemAction';

export default class PlayerView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.player = elements.player;
      this.bigBlind = elements.initial_blind;
      this.xPlace = elements.x_place;
      this.yPlace = elements.y_place;
      this.commonInterval = elements.common_interval;
      this.currentActionSerif = '';
      const playerId = this.player.id;
      this.initializeSprite(
        'player_bet_chip_' + playerId,
        elements.x_place + this.sprites[this.player.characterData.getSpriteKey('normal')].width + elements.common_interval,
        elements.y_place + elements.chip_place_interval
      );
      this.initializeLabel(
        'player_bet_chip_value_' + playerId,
        this.sprites['player_bet_chip_' + playerId].x + this.sprites['player_bet_chip_' + playerId].width + elements.common_interval,
        this.sprites['player_bet_chip_' + playerId].y,
        '36px sans-serif',
        'white'
      );
      this.initializeLabel(
        'pot_get_message_' + playerId,
        this.sprites['player_bet_chip_' + playerId].x,
        this.sprites['player_bet_chip_' + playerId].y,
        '32px sans-serif',
        'white'
      );
      this.initializeLabel(
        'player_name_' + playerId,
        elements.x_place + this.sprites[this.player.characterData.getSpriteKey('normal')].width + elements.common_interval,
        elements.y_place,
        '36px sans-serif',
        'white'
      );
      this.labels['player_name_' + playerId].width = 0.25 * Conf.main.width;
      this.initializeLabel(
        'player_stack_' + playerId,
        this.labels['player_name_' + playerId].x + 0.75 * this.labels['player_name_' + playerId].width,
        elements.y_place,
        '36px sans-serif',
        'white'
      );
      this.dealerPositionY = this.sprites['player_bet_chip_' + playerId].y + elements.relative_dealer_position_y;
      resolve();
    }).then(()=>{
      return this.initializeCharacterView(elements);
    });
  }

  initializeCharacterView(elements) {
    return new Promise((resolve, reject) => {
      const sprites = {};
      sprites['serif' + this.player.characterData.name] = this.sprites['serif' + this.player.characterData.name];
      this.player.characterData.getSpriteData().forEach(data => {
        sprites[data.sprite_key] = this.sprites[data.sprite_key];
      });
      const labels = {};
      labels['serif' + this.player.characterData.name] = new Label('');
      const properties = {
        'characterData': this.player.characterData,
        'x': elements.x_place,
        'y': elements.y_place,
        'center_x': elements.center_x,
        'center_y': elements.center_y
      };
      this.characterView = new CharacterView();
      resolve(this.characterView.initialize(sprites, labels, properties));
    }).then(()=>{
      this.removeSprite('serif' + this.player.characterData.name);
      this.player.characterData.getSpriteData().forEach(data => {
        this.removeSprite(data.sprite_key);
      });
      return Promise.resolve();
    })
  }

  showFirst() {
    this.showAll();
    this.hideSprite('player_bet_chip_' + this.player.id);
    this.characterView.showFirst();
  }

  handDraw(cardSprites) {
    for (let index = 0; index < cardSprites.length; index++) {
      const sprite = cardSprites[index];
      sprite.x = this.xPlace + this.commonInterval + this.characterView.getCharaSpriteWidth() + (sprite.width + this.commonInterval) * index;
      sprite.y = this.yPlace + this.characterView.getCharaSpriteHeight() - sprite.height;
      this.addSprite('player_id_' + this.player.id + '_num' + index, sprite);
      this.showSprite('player_id_' + this.player.id + '_num' + index);
    }
  }

  getCardImageNames() {
    return this.player.getCards().map(card => card.getCardImageName());
  }

  initialActionDraw() {
    const position = this.player.getPosition();
    if (position === Position.BIG_BLIND) {
      this.actionDraw(this.player.id, new ActionModel(TexasHoldemAction.ACTION_NONE, this.bigBlind));
    } else if (position === Position.SMALL_BLIND || position === Position.DEALER_FOR_HEADS_UP) {
      this.actionDraw(this.player.id, new ActionModel(TexasHoldemAction.ACTION_NONE, this.bigBlind / 2));
    }
  }

  changeStackText(stackValue) {
    this.labels['player_stack_' + this.player.id].text = '残り：' + stackValue;
  }

  actionDraw(id, action) {
    if (this.player.id !== id) {
      return;
    }
    const restStack = this.player.getStack() - action.value;
    this.changeStackText(restStack);
    if (action.value > 0) {
      const chipSpriteKey = 'player_bet_chip_' + id;
      this.labels['player_bet_chip_value_' + id].text = action.value + 'BET';
      this.showSprite(chipSpriteKey);
    }
    let actionSerif = this.getActionSerif(action.name);
    if (actionSerif !== '') {
      this.currentActionSerif = actionSerif;
      this.characterView.showSerif(actionSerif);
    }
  }

  getActionSerif(actionName) {
    switch(actionName) {
      case TexasHoldemAction.ACTION_ALLIN:
        return this.player.characterData.serifs.allin;
      case TexasHoldemAction.ACTION_RAISE:
        return this.player.characterData.serifs.raise;
      case TexasHoldemAction.ACTION_CALL:
        return this.player.characterData.serifs.call;
      case TexasHoldemAction.ACTION_CHECK:
        return this.player.characterData.serifs.check;
      case TexasHoldemAction.ACTION_FOLD:
        return this.player.characterData.serifs.fold;
      default:
        return '';
    }
  }

  foldDraw(id) {
    if (this.player.id !== id) {
      return;
    }
    this.hideSprite('player_id_' + id + '_num0');
    this.hideSprite('player_id_' + id + '_num1');
  }

  showDownDraw() {
    const cards = this.player.getCards();
    if (cards.length === 2) {
      this.sprites['player_id_' + this.player.id + '_num0'].image = ImageRepository.getImage('trump/' + cards[0].getCardImageName());
      this.sprites['player_id_' + this.player.id + '_num1'].image = ImageRepository.getImage('trump/' + cards[1].getCardImageName());
    }
  }

  rankDraw(ranks) {
    const targets = ranks.filter(rank => rank.id === this.player.id);
    if (targets.length === 1) {
      this.characterView.showSerif(targets[0].rank.getRankName());
    }
  }

  resultDraw(pots) {
    const targets = pots.filter(pot => pot.id === this.player.id);
    if (targets.length !== 1) {
      return;
    }
    const pot = targets[0];
    let message = 'ポッド獲得できず。。。';
    if (pot.chip > 0) {
      message = pot.chip + '獲得！！';
    }
    this.labels['pot_get_message_' + pot.id].text = message;
  }

  moveChipDraw() {
    this.changeStackText(this.player.getStack());
    this.labels['player_bet_chip_value_' + this.player.id].text = '';
  }

  changeExpressionDraw(isWin) {
    this.characterView.changeExpressionByResult(isWin);
  }

  studySerifDraw(isPraise) {
    this.characterView.showSerifWhenStudy(isPraise);
  }

  studySerifDrawErase() {
    this.characterView.hideSerif();
    if (this.currentActionSerif !== '') {
      this.characterView.showSerif(this.currentActionSerif);
    }
  }

  actionDrawErase() {
    this.currentActionSerif = '';
    this.changeStackText(this.player.getStack());
    this.labels['player_bet_chip_value_' + this.player.id].text = '';
    this.hideSprite('player_bet_chip_' + this.player.id);
    this.characterView.hideSerif();
  }

  oneGameDrawErase() {
    this.hideSprite('player_id_' + this.player.id + '_num0');
    this.hideSprite('player_id_' + this.player.id + '_num1');
    this.characterView.hideSerif();
    this.labels['pot_get_message_' + this.player.id].text = '';
    this.characterView.repositExpression();
  }

  isDealerPosition() {
    const position = this.player.getPosition();
    return position === Position.DEALER_FOR_HEADS_UP || position === Position.DEALER;
  }

  getSeatNumber() {
    return this.player.getSeatNumber();
  }

  getPlayerId() {
    return this.player.id;
  }

  getDealerPosition() {
    return {
      x: this.sprites['player_bet_chip_' + this.player.id].x + 3 * this.sprites['player_bet_chip_' + this.player.id].width ,
      y: this.sprites['player_bet_chip_' + this.player.id].y
    };
  }
}
