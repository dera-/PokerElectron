import ObjectView from '../../ObjectView';
import Conf from '../../../config/conf.json'
import ImageRepository from '../../../repository/ImageRepository';
import * as Position from '../../../const/game/Position';
import PlayerCardView from './PlayerCardView';
import RankCardView from './RankCardView';
import CharacterView from './CharacterView';
import ActionModel from '../../../model/game/ActionModel';
import * as TexasHoldemAction from '../../../const/game/TexasHoldemAction';

export default class PlayerView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.player = elements.player;
      this.bigBlind = elements.initial_blind;
      const playerId = this.player.id;
      this.initializeSprite(
        'player_bet_chip_' + playerId,
        elements.center_x + 0.9 * elements.long_radius * Math.cos(elements.angle * Math.PI / 180),
        elements.center_y + 0.9 * elements.short_radius * Math.sin(elements.angle * Math.PI / 180)
      );
      if (elements.center_y < this.sprites['player_bet_chip_' + playerId].y) {
          this.sprites['player_bet_chip_' + playerId].y -= this.sprites['player_bet_chip_' + playerId].height;
      }
      const actionKeys = ['allin_action', 'raise_action', 'call_action', 'fold_action'];
      actionKeys.forEach(key => {
        this.initializeSprite(
          key + playerId,
          elements.x_place + 1.05 * this.sprites['player_card_' + playerId].width,
          elements.y_place + 0.25 * this.sprites['player_card_' + playerId].height
        );
      });
      this.initializeLabel(
        'player_bet_chip_value_' + playerId,
        elements.x_place + 1.05 * this.sprites['player_card_' + playerId].width,
        elements.y_place,
        '36px sans-serif',
        'black'
      );
      this.initializeLabel('pot_get_message_' + playerId, elements.x_place, this.sprites['player_bet_chip_' + playerId].y, '32px sans-serif');
      resolve();
    }).then(()=>{
      return this.initializePlayerCardView(elements);
    }).then(()=>{
      return this.initializeRankCardView(elements);
    }).then(()=>{
      return this.initializeCharacterView();
    });
  }

  initializeCharacterView() {
    return new Promise((resolve, reject) => {
      const sprites = {};
      this.player.characterData.getSpriteData().forEach(data => {
        sprites[data.sprite_key] = this.sprites[data.sprite_key];
      });
      const properties = {
        'id': this.player.id,
        'name': this.player.characterData.name,
        'image': this.player.characterData.image,
        'x': this.playerCardView.getX() - 0.2 * Conf.main.width,
        'y': this.playerCardView.getY()
      };
      this.characterView = new CharacterView();
      resolve(this.characterView.initialize(sprites, {}, properties));
    }).then(()=>{
      this.player.characterData.getSpriteData().forEach(data => {
        this.removeSprite(data.sprite_key);
      });
      return Promise.resolve();
    })
  }

  initializePlayerCardView(elements) {
    return new Promise((resolve, reject) => {
      const sprites = {};
      sprites['player_card_' + this.player.id] = this.sprites['player_card_' + this.player.id];
      const labels = {};
      labels['player_name_' + this.player.id] = this.labels['player_name_' + this.player.id];
      labels['player_stack_' + this.player.id] = this.labels['player_stack_' + this.player.id];
      this.playerCardView = new PlayerCardView();
      resolve(this.playerCardView.initialize(sprites, labels, elements));
    }).then(()=>{
      this.removeSprite('player_card_' + this.player.id);
      this.removeLabel('player_name_' + this.player.id);
      this.removeLabel('player_stack_' + this.player.id);
      return Promise.resolve();
    });
  }

  initializeRankCardView(elements) {
    return new Promise((resolve, reject) => {
      const sprites = {};
      sprites['rank_card' + this.player.id] = this.sprites['rank_card' + this.player.id];
      const labels = {};
      labels['result_rank' + this.player.id] = this.labels['result_rank' + this.player.id];
      this.rankCardView = new RankCardView();
      elements.player_card_width = this.playerCardView.getWidth();
      elements.player_card_height = this.playerCardView.getHeight();
      resolve(this.rankCardView.initialize(sprites, labels, elements));
    }).then(()=>{
      this.removeSprite('rank_card' + this.player.id);
      this.removeLabel('result_rank' + this.player.id);
      return Promise.resolve();
    });
  }

  showFirst() {
    this.showAll();
    this.hideSprite('player_bet_chip_' + this.player.id);
    this.playerCardView.showFirst();
    this.hideActionSprites();
    this.characterView.showFirst();
  }

  hideActionSprites() {
    this.hideSprite('allin_action' + this.player.id);
    this.hideSprite('raise_action' + this.player.id);
    this.hideSprite('call_action' + this.player.id);
    this.hideSprite('fold_action' + this.player.id);
  }

  handDraw(cardSprites) {
    for (let index = 0; index < cardSprites.length; index++) {
      const sprite = cardSprites[index];
      sprite.x = this.playerCardView.getX() + this.playerCardView.getWidth() + (index - 2) * sprite.width;
      sprite.y = this.playerCardView.getY();
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

  actionDraw(id, action) {
    if (this.player.id !== id) {
      return;
    }
    const restStack = this.player.getStack() - action.value;
    this.playerCardView.changeStackText(restStack);
    if (action.value > 0) {
      const chipSpriteKey = 'player_bet_chip_' + id;
      this.labels['player_bet_chip_value_' + id].text = action.value + 'BET';
      this.showSprite(chipSpriteKey);
    }
    this.hideActionSprites();
    let actionSpriteKey = this.getActionSpriteKey(action.name);
    if (actionSpriteKey !== '') {
      this.showSprite(actionSpriteKey);
      this.sprites[actionSpriteKey].tl.fadeIn(120);
    }
  }

  getActionSpriteKey(actionName) {
    switch(actionName) {
      case TexasHoldemAction.ACTION_ALLIN:
        return 'allin_action' + this.player.id;
      case TexasHoldemAction.ACTION_RAISE:
        return 'raise_action' + this.player.id;
      case TexasHoldemAction.ACTION_CALL:
        return 'call_action' + this.player.id;
      case TexasHoldemAction.ACTION_CHECK:
        return 'call_action' + this.player.id;
      case TexasHoldemAction.ACTION_FOLD:
        return 'fold_action' + this.player.id;
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
      this.rankCardView.showRank(targets[0]);
    }
  }

  resultDraw(pots) {
    const targets = pots.filter(pot => pot.id === this.player.id);
    if (targets.length !== 1) {
      return;
    }
    const pot = targets[0];
    let message = 'ポッド獲得できず。。。',
      messageColor = 'black';
    if (pot.chip > 0) {
      message = pot.chip + '獲得！！';
      messageColor = 'orange';
    }
    this.labels['pot_get_message_' + pot.id].text = message;
    this.labels['pot_get_message_' + pot.id].color = messageColor;
  }

  moveChipDraw() {
    this.playerCardView.changeStackText(this.player.getStack());
    this.labels['player_bet_chip_value_' + this.player.id].text = '';
  }

  actionDrawErase() {
    this.playerCardView.changeStackText(this.player.getStack());
    this.labels['player_bet_chip_value_' + this.player.id].text = '';
    this.hideSprite('player_bet_chip_' + this.player.id);
    this.hideActionSprites();
  }

  oneGameDrawErase() {
    this.hideSprite('player_id_' + this.player.id + '_num0');
    this.hideSprite('player_id_' + this.player.id + '_num1');
    this.rankCardView.hideRank(this.player.id);
    this.labels['pot_get_message_' + this.player.id].text = '';
  }

  isDealerPosition() {
    const position = this.player.getPosition();
    return position === Position.DEALER_FOR_HEADS_UP || position === Position.DEALER;
  }

  getSeatNumber() {
    return this.player.getSeatNumber();
  }
}
