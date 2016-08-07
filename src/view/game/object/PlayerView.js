import ObjectView from '../../ObjectView';
import ImageRepository from '../../../repository/ImageRepository';
import * as Position from '../../../const/game/Position';
import PlayerCardView from './PlayerCardView';
import RankCardView from './RankCardView';

export default class PlayerView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.player = elements.player;
      this.bigBlind = elements.initial_blind;
      const playerId = this.player.id;
      this.sprites['player_bet_chip_' + playerId].x =
        elements.center_x + 0.9 * elements.long_radius * Math.cos(elements.angle * Math.PI / 180);
      this.sprites['player_bet_chip_' + playerId].y =
        elements.center_y + 0.9 * elements.short_radius * Math.sin(elements.angle * Math.PI / 180);
      if (elements.center_y < this.sprites['player_bet_chip_' + playerId].y) {
          this.sprites['player_bet_chip_' + playerId].y -= this.sprites['player_bet_chip_' + playerId].height;
      }
      this.labels['player_bet_chip_value_' + playerId].moveTo(
        elements.center_x + 0.7 * elements.long_radius * Math.cos((elements.angle + 10) * Math.PI / 180),
        elements.center_y + 0.7 * elements.short_radius * Math.sin((elements.angle + 10) * Math.PI / 180)
      );
      this.labels['player_bet_chip_value_' + playerId].color = 'white';
      this.labels['player_bet_chip_value_' + playerId].font = '14px sans-serif';
      this.labels['pot_get_message_' + playerId].moveTo(
        this.sprites['player_card_' + playerId].x,
        this.sprites['player_bet_chip_' + playerId].y
      );
      this.labels['pot_get_message_' + playerId].font = '32px sans-serif';
      resolve();
    }).then(()=>{
      return this.initializePlayerCardView(elements);
    }).then(()=>{
      return this.initializeRankCardView(elements);
    })
  }

  initializePlayerCardView(elements) {
    return new Promise((resolve, reject) => {
      const sprites = {
        'player_card_' + this.player.id: this.sprites['player_card_' + this.player.id]
      };
      const labels = {
        'player_name_' + this.player.id: this.labels['player_name_' + this.player.id],
        'player_stack_' + this.player.id: this.labels['player_stack_' + this.player.id]
      };
      this.playerCardView = new PlayerCardView(sprites, labels, elements);
      resolve();
    }).then(()=>{
      this.removeSprite('player_card_' + this.player.id);
      this.removeLabel('player_name_' + this.player.id);
      this.removeLabel('player_stack_' + this.player.id);
      return Promise.resolve();
    });
  }

  initializeRankCardView(elements) {
    return new Promise((resolve, reject) => {
      const sprites = {
        'rank_card' + this.player.id: this.sprites['rank_card' + this.player.id]
      };
      const labels = {
        'result_rank' + this.player.id: this.labels['result_rank' + this.player.id],
      };
      this.rankCardView = new RankCardView(sprites, labels, elements);
      resolve();
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
    this.labels['player_stack_' + id].text = '残り：' + restStack;
    if (action.value > 0) {
      const chipSpriteKey = 'player_bet_chip_' + id;
      this.labels['player_bet_chip_value_' + id].text = action.name + '：' + action.value;
      this.showSprite(chipSpriteKey);
    } else {
      this.labels['player_bet_chip_value_' + id].text = action.name;
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
    this.labels['player_stack_' + this.player.id].text = '残り：' + this.player.getStack();
    this.labels['player_bet_chip_value_' + this.player.id].text = '';
  }

  actionDrawErase() {
    this.labels['player_stack_' + this.player.id].text = '残り：' + this.player.getStack();
    this.labels['player_bet_chip_value_' + this.player.id].text = '';
    this.hideSprite('player_bet_chip_' + this.player.id);
  }

  oneGameDrawErase() {
    this.hideSprite('player_id_' + this.player.id + '_num0');
    this.hideSprite('player_id_' + this.player.id + '_num1');
    this.rankCardView.hideRank(this.player.id);
  }

  isDealerPosition() {
    const position = this.player.getPosition();
    return position === Position.DEALER_FOR_HEADS_UP || position === Position.DEALER;
  }

  getSeatNumber() {
    return this.player.getSeatNumber();
  }
}
