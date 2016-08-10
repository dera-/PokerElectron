import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/game/sprites.json';
import SpriteFactory from '../../factory/SpriteFactory';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import AiPlayerView from './object/AiPlayerView';
import BoardView from './object/BoardView';
import MyPlayerView from './object/MyPlayerView';
import InformationView from './object/InformationView';
import SelectWindowView from './object/SelectWindowView';
import * as PlayerDicision from '../../const/game/PlayerDicision';
import SceneRepository from '../../repository/SceneRepository';

export default class TexasHoldemView extends BaseView {
  initializeTexasHoldemView(players, initialBlind, stageData) {
    return this.initialize(this.getImages(SpritesConf.images, players)).then(() => {
      return SpriteFactory.generateWithPromise(0, 0, stageData.back_ground);
    }).then((backGroundSprite)=>{
      this.sprites['back_ground'] = backGroundSprite;
      return this.initializeProperties(players, initialBlind);
    }).then(initialInformation => {
      return this.initializeBordView(initialInformation);
    }).then(initialInformation => {
      return this.initializePlayerViews(initialInformation);
    }).then(initialInformation => {
      return this.initializeInformationView(initialInformation);
    }).then(initialInformation =>{
      return this.initializeSelectWindowViews(initialInformation);
    });
  }

  getImages(images, players) {
    players.forEach(player => {
      player.characterData.getSpriteData().forEach(data => {
        images.push({name:data.sprite_key, x:0, y:0, image_path:data.image_path});
      });
    });
    return images;
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

  initializeSelectWindowViews(initialInformation) {
    let properties;
    return new Promise((resolve, reject) => {
      properties = {
        choices: [PlayerDicision.REPLAY, PlayerDicision.TITLE],
        x: 0.28 * Conf.main.width,
        y: 0.65 * Conf.main.height,
        inner_x_interval: 0.05 * this.sprites['common_select_button'].width,
        inner_y_interval: 0.2 * this.sprites['common_select_button'].height,
        outer_interval: 0.23 * Conf.main.width,
        font: '28px sans-serif',
        color: 'white'
      };
      resolve();
    }).then(() => {
      const sprites = {
        'win_back': SpriteFactory.getRect(0, 0, Conf.main.width, Conf.main.height, "rgba(0, 0, 0, 0.75)"),
        'win_icon': this.sprites['win_icon'],
        'select_win_1': SpriteFactory.getClone(this.sprites['common_select_button']),
        'select_win_2': SpriteFactory.getClone(this.sprites['common_select_button'])
      };
      const labels = {
        'select_win_1': new Label('もう一回'),
        'select_win_2': new Label('タイトルへ')
      };
      properties.name = 'win';
      this.winView = new SelectWindowView();
      return Promise.resolve(this.winView.initialize(sprites, labels, properties));
    }).then(() => {
      const sprites = {
        'lose_back': SpriteFactory.getRect(0, 0, Conf.main.width, Conf.main.height, "rgba(0, 0, 0, 0.75)"),
        'lose_icon': this.sprites['lose_icon'],
        'select_lose_1': SpriteFactory.getClone(this.sprites['common_select_button']),
        'select_lose_2': SpriteFactory.getClone(this.sprites['common_select_button'])
      };
      const labels = {
        'select_lose_1': new Label('もう一回'),
        'select_lose_2': new Label('タイトルへ')
      };
      properties.name = 'lose';
      this.loseView = new SelectWindowView();
      return Promise.resolve(this.loseView.initialize(sprites, labels, properties));
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
        x: 0.6 * Conf.main.width,
        y: 0.05 * Conf.main.height,
        interval: 0.04 * Conf.main.height,
        color: 'black',
        font: '28px sans-serif'
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
        sprites['allin_action' + player.id] = SpriteFactory.getClone(this.sprites['allin_action']);
        sprites['raise_action' + player.id] = SpriteFactory.getClone(this.sprites['raise_action']);
        sprites['call_action' + player.id] = SpriteFactory.getClone(this.sprites['call_action']);
        sprites['fold_action' + player.id] = SpriteFactory.getClone(this.sprites['fold_action']);
        player.characterData.getSpriteData().forEach(data => {
          sprites[data.sprite_key] = this.sprites[data.sprite_key];
        });
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
    // 一旦、背景用のviewは作らない感じで
    SceneRepository.addEntityToCurrentScene('sprite_back_ground', this.sprites['back_ground']);
    this.boardView.showFirst();
    this.playerViews.forEach(playerView => {
      playerView.showFirst();
    });
    this.informationView.showFirst();
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

  // キャラの表情の変換
  changeCharactersExpressionDraw(winners) {
    this.playerViews.forEach(view => {
      if (winners.some(winner => winner.id === view.player.id)) {
        view.changeExpressionDraw(true);
      } else {
        view.changeExpressionDraw(false);
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

  // 最終的に買ったか負けたかの表示
  gameResultDraw(isWin) {
    if (isWin) {
      this.currentSelectWindow = this.winView;
    } else {
      this.currentSelectWindow = this.loseView;
    }
    this.currentSelectWindow.showFirst();
  }

  getPlayerDicision() {
    const playerChoice = this.currentSelectWindow.getCurrentChoice();
    this.currentSelectWindow.resetCurrentChoice();
    return playerChoice;
  }

  hideSelectWindow() {
    this.currentSelectWindow.hideAll();
    this.currentSelectWindow = null;
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
    this.informationView.changeMainInfoText('現フェーズ：' + phase);
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
