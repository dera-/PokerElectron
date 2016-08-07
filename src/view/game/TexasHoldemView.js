import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/game/sprites.json';
import SpriteFactory from '../../factory/SpriteFactory';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import AiPlayerView from './object/AiPlayerView';
import BoardView from './object/BoardView';
import MyPlayerView from './object/MyPlayerView';

export default class TexasHoldemView extends BaseView {
  initializeTexasHoldemView(players, initialBlind) {
    return this.initialize(SpritesConf.images).then(()=>{
      return this.initializeProperties(players, initialBlind);
    }).then(initialInformation => {
      return this.initializeBordView(initialInformation);
    }).then(initialInformation => {
      return this.initializePlayerViews(initialInformation);
    }).then(()=>{
      return this.initializeSpriteEvents();
    });
  }

  initializeProperties(players, initialBlind) {
    return new Promise((resolve, reject) => {
      const playersNum = players.length;
      const info = {
        'players': players,
        'initial_blind': initialBlind,
        'angle_interval': Math.round(360 / playersNum),
        'short_radius': Math.round(this.sprites['poker_table'].height / 2),
        'long_radius': Math.round(this.sprites['poker_table'].width / 2),
        'center_x': this.sprites['poker_table'].x + this.longRadius,
        'center_y': this.sprites['poker_table'].y + this.shortRadius
      }
      resolve(info);
    });
  }

  initializeBordView(initialInformation) {
    return new Promise((resolve, reject) => {
      const sprites = {
        'poker_table': this.sprites['poker_table'],
        'deeler_button': this.sprites['deeler_button']
      };
      const labels = {
        'pot_value': new Label('合計掛け金：0')
      };
      const properties = {
        'angle_interval': initialInformation.angle_interval,
        'short_radius': initialInformation.short_radius,
        'long_radius': initialInformation.long_radius,
        'center_x': initialInformation.center_x,
        'center_y': initialInformation.center_y,
      };
      this.boardView = new BoardView(sprites, labels, properties);
      resolve(initialInformation);
    });
  }

  initializePlayerViews(initialInformation) {
    return new Promise((resolve, reject) => {
      this.playerViews = [];
      let index = 0;
      initialInformation.players.forEach(player =>{
        let xPlace, yPlace;
        const cardSprite = SpriteFactory.getClone(this.sprites['player_card']);
        const rankCardSprite = SpriteFactory.getClone(this.sprites['rank_card']);
        const chipSprite = SpriteFactory.getClone(this.sprites['chip'])
        const angle = (90 + initialInformation.angle_interval * index) % 360;
        xPlace = initialInformation.center_x + initialInformation.long_radius * Math.cos(angle * Math.PI / 180);
        if (xPlace < initialInformation.center_x) {
          xPlace -= cardSprite.width;
        }
        yPlace = initialInformation.center_y + 0.95 * initialInformation.short_radius * Math.sin(angle * Math.PI / 180);
        if (yPlace < initialInformation.center_y) {
          yPlace -= cardSprite.height;
        }
        const sprites = {
          'player_card_' + player.id: cardSprite,
          'player_bet_chip_' + player.id: chipSprite,
          'rank_card' + player.id: rankCardSprite,
        };
        const labels = {
          'player_name_' + player.id: new Label('ID：' + player.id),
          'player_stack_' + player.id: new Label('残り：' + player.getStack()),
          'player_bet_chip_value_' + player.id: new Label(''),
          'pot_get_message_' + player.id: new Label(''),
          'result_rank' + player.id: new Label('')
        };
        const properties = {
          'player': player,
          'initial_blind': initialInformation.initial_blind,
          'x_place': xPlace,
          'y_place': yPlace,
          'angle': angle,
          'short_radius': initialInformation.short_radius,
          'long_radius': initialInformation.long_radius,
          'center_x': initialInformation.center_x,
          'center_y': initialInformation.center_y,
        };
        let playerView;
        if (player.id === Conf.data.player.id) {
          playerView = new MyPlayerView(sprites, labels, properties);
          sprites['bet_slider'] = this.sprites['bet_slider'];
          sprites['bet_bar'] = this.sprites['bet_bar'];
          sprites['fold'] = this.sprites['fold'];
          sprites['call'] = this.sprites['call'];
          sprites['raise'] = this.sprites['raise'];
          labels['bet_value'] = new Label('0 Bet');
        } else {
          playerView = new AiPlayerView(sprites, labels, properties);
        }
        this.playerViews.push(playerView);
        index++;
      });
      resolve(initialInformation);
    });
  }

  initializeSpriteEvents() {
    return new Promise((resolve, reject) => {
      this.boardView.registerEntityEvent();
      this.playerViews.forEach(playerView => {
        playerView.registerEntityEvent();
      });
      resolve();
    });
  }

  showFirst() {
    this.boardView.showFirst();
    this.playerViews.forEach(playerView => {
      playerView.showFirst();
    });
  }

  // ディーラーポジションを決める描画
  decidePositionDraw() {
    let deelerIndex;
    this.playerViews.forEach(view => {
      view.initialActionDraw();
      if (view.isDealerPosition()) {
        deelerIndex = view.getSeatNumber();
      }
    });
    this.board.decidePositionDraw(deelerIndex);
  }

  // ボードにカードを表示する
  setCardsDraw(cards) {
    this.boardView.setCardsDraw(cards.map(card => this.sprites['card_trump/' + card.getCardImageName()]));
  }

  // カード配る部分の描画
  dealCardsDraw() {
    this.playerViews.forEach(view => {
      const sprites;
      if (view instanceof MyPlayerView) {
        cardNames = view.getCardImageNames();
        sprites = [
          this.sprites['card_trump/' + cardNames[0]],
          this.sprites['card_trump/' + cardNames[1]]
        ];
      } else {
        sprites = [
          SpriteFactory.getClone(this.sprites['card_trump/z01.png']),
          SpriteFactory.getClone(this.sprites['card_trump/z01.png'])
        ];
      }
      view.handDraw(sprites);
    });
  }

  // プレーヤーのアクションの描画
  actionDraw(id, action) {
    this.playerViews.forEach(view => {
      view.actionDraw(id, action);
    });
  }

  // ポット額変動時の描画
  potDraw(potValue) {
    this.boardView.potDraw(potValue);
  }

  // fold時の描画
  foldDraw(id) {
    this.playerViews.forEach(view => {
      view.foldDraw(id);
    });
  }

  // ショーダウン時の描画
  showDownDraw() {
    this.playerViews.forEach(view => {
      if (!view instanceof MyPlayerView) {
        view.showDownDraw();
      }
    });
  }

  // 役名表示
  ranksDraw(ranks) {
    this.playerViews.forEach(view => {
      view.rankDraw(ranks);
    });
  }

  // 結果表示
  resultDraw(pots) {
    this.playerViews.forEach(view => {
      view.resultDraw(pots);
    });
  }

  // チップ変動
  shareChips() {
    this.potDraw(0);
    this.playerViews.forEach(view => {
      this.view.moveChipDraw();
    });
  }

  // アクション時の描画取り消し
  actionDrawErase() {
    this.playerViews.forEach(view => {
      this.view.actionDrawErase();
    });
  }

  // 1ゲーム分の描画取り消し
  oneGameDrawErase() {
    this.boardView.cardsDrawErace();
    this.playerViews.forEach(view => {
      this.view.actionDrawErase();
    });
  }

  getCurrentBetValue() {
    return this.getMyPlayerView().getCurrentBetValue();
  }

  setCallValue(callValue) {
    this.getMyPlayerView().setCallValue(callValue);
  }

  setPlayerBetValue() {
    this.getMyPlayerView().setPlayerBetValue();
  }

  resetOneAction() {
    this.getMyPlayerView().resetAction();
  }

  getMyPlayerView() {
    const myPlayerViews = this.playerViews.filter(view => view instanceof MyPlayerView);
    return myPlayerViews[0];
  }

  resetOnePhase() {
    this.getMyPlayerView().resetOnePhase();
  }

  resetBoard() {
    this.boardView.reset();
  }
}
