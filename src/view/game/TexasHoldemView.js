import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/game/sprites.json';
import SpriteFactory from '../../factory/SpriteFactory';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import AiPlayerView from './object/AiPlayerView';
import BoardView from './object/BoardView';
import MyPlayerView from './object/MyPlayerView';
import InformationView from './object/InformationView';

export default class TexasHoldemView extends BaseView {
  initializeTexasHoldemView(players, initialBlind) {
    return this.initialize(SpritesConf.images).then(()=>{
      return this.initializeProperties(players, initialBlind);
    }).then(initialInformation => {
      return this.initializeBordView(initialInformation);
    }).then(initialInformation => {
      return this.initializePlayerViews(initialInformation);
    }).then(initialInformation => {
      return this.initializeInformationView(initialInformation);
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
        'long_radius': Math.round(this.sprites['poker_table'].width / 2)
      };
      info['center_x'] = this.sprites['poker_table'].x + info['long_radius'];
      info['center_y'] = this.sprites['poker_table'].y + info['short_radius'];
      resolve(info);
    });
  }

  initializeInformationView(initialInformation) {
    return new Promise((resolve, reject) => {
      const labels = {
        'main_info_rightup': new Label(''),
        'sub_info_rightup': new Label('')
      };
      const properties = {
        name: 'rightup',
        x: 0.75 * Conf.main.width,
        y: 0.08 * Conf.main.height,
        interval: 0.08 * Conf.main.height,
        color: 'black',
        font: '32px sans-serif'
      };
      this.informationView = new InformationView();
      resolve(this.informationView.initialize({}, labels, properties));
    }).then(()=>{
      return Promise.resolve(initialInformation);
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
      this.boardView = new BoardView();
      resolve(this.boardView.initialize(sprites, labels, properties));
    }).then(()=>{
      return Promise.resolve(initialInformation);
    });
  }

  initializePlayerViews(initialInformation) {
    return new Promise((resolve, reject) => {
      this.playerViews = [];
      const promises = [];
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
        const sprites = {};
        sprites['player_card_' + player.id] = cardSprite;
        sprites['player_bet_chip_' + player.id] = chipSprite;
        sprites['rank_card' + player.id] = rankCardSprite;
        const labels = {};
        labels['player_name_' + player.id] = new Label('ID：' + player.id);
        labels['player_stack_' + player.id] = new Label('残り：' + player.getStack());
        labels['player_bet_chip_value_' + player.id] = new Label('');
        labels['pot_get_message_' + player.id] = new Label('');
        labels['result_rank' + player.id] = new Label('');
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
          sprites['bet_bar'] = this.sprites['bet_bar'];
          sprites['bet_slider'] = this.sprites['bet_slider'];
          sprites['fold'] = this.sprites['fold'];
          sprites['call'] = this.sprites['call'];
          sprites['raise'] = this.sprites['raise'];
          sprites['forbbiden_icon'] = SpriteFactory.getClone(this.sprites['forbbiden_icon']);
          playerView = new MyPlayerView();
        } else {
          playerView = new AiPlayerView();
        }
        this.playerViews.push(playerView);
        promises.push(playerView.initialize(sprites, labels, properties));
        index++;
      });
      resolve(promises);
    }).then(promises=>{
      return Promise.all(promises);
    }).then(()=>{
      return Promise.resolve(initialInformation);
    })
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
    this.boardView.decidePositionDraw(deelerIndex);
  }

  // ボードにカードを表示する
  setCardsDraw(cards) {
    this.boardView.setCardsDraw(cards.map(card => this.sprites['card_trump/' + card.getCardImageName()]));
  }

  // カード配る部分の描画
  dealCardsDraw() {
    this.playerViews.forEach(view => {
      let sprites;
      if (view instanceof MyPlayerView) {
        const cardNames = view.getCardImageNames();
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
      if (false === (view instanceof MyPlayerView)) {
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
      view.moveChipDraw();
    });
  }

  // アクション時の描画取り消し
  actionDrawErase() {
    this.playerViews.forEach(view => {
      view.actionDrawErase();
    });
  }

  // 1ゲーム分の描画取り消し
  oneGameDrawErase() {
    this.boardView.cardsDrawErace();
    this.playerViews.forEach(view => {
      view.oneGameDrawErase();
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

  setPhaseInformation(phase) {
    this.informationView.changeMainInfoText('現在のフェーズ：' + phase);
  }

  setSubInformation(text) {
    this.informationView.changeSubInfoText(text);
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

  getCurrentAction() {
    return this.getMyPlayerView().getCurrentAction();
  }
}
