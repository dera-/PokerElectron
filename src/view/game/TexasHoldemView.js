import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/game/sprites.json';
import SoundsConfig from '../../config/game/sounds.json';
import SpriteFactory from '../../factory/SpriteFactory';
import * as BaseAction from '../../const/BaseAction';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import AiPlayerView from './object/AiPlayerView';
import BoardView from './object/BoardView';
import MyPlayerView from './object/MyPlayerView';
import InformationView from './object/InformationView';
import SelectWindowView from './object/SelectWindowView';
import * as PlayerDicision from '../../const/game/PlayerDicision';
import SceneRepository from '../../repository/SceneRepository';
import * as MachineStudy from '../../const/game/learn/MachineStudy';
import StudyView from './object/StudyView';
import ButtonView from '../object/ButtonView'


const commonInterval = 0.01 * Conf.main.width;
export default class TexasHoldemView extends BaseView {
  async initializeTexasHoldemView(players, initialBlind, stageData) {
    await this.initialize(this.getImages(SpritesConf.images, players), stageData.bgm, SoundsConfig.sounds);
    this.sprites['back_ground'] = await SpriteFactory.generateWithPromise(0, 0, stageData.back_ground);
    const initialInformation = await this.initializeProperties(players, initialBlind);
    await this.initializeBordView(initialInformation);
    await this.initializePlayerViews(initialInformation);
    await this.initializeInformationView(initialInformation);
    await this.initializeSelectWindowViews(initialInformation);
    await this.initializeStudyView(initialInformation);
    await this.initializeReturnButtonView(initialInformation);
    await this.initializeSaveButtonView(initialInformation);
    await this.initializeWaitingMessageView(initialInformation);
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

  initializeReturnButtonView(initialInformation) {
    return new Promise((resolve, reject) => {
      const sprites = {
        'return_to_title': this.sprites['return_to_title']
      };
      const properties = {
        'name': 'return_to_title'
      };
      this.returnToTitleButtonView = new ButtonView();
      resolve(this.returnToTitleButtonView.initialize(sprites, {}, properties));
    }).then(() => {
      return Promise.resolve(initialInformation);
    });
  }

  initializeSaveButtonView(initialInformation) {
    return new Promise((resolve, reject) => {
      const sprites = {
        'save_learn_data': this.sprites['save_learn_data']
      };
      const properties = {
        'name': 'save_learn_data'
      };
      this.saveLearnDataButtonView = new ButtonView();
      resolve(this.saveLearnDataButtonView.initialize(sprites, {}, properties));
    }).then(() => {
      return Promise.resolve(initialInformation);
    });
  }

  initializeStudyView(initialInformation) {
    return new Promise((resolve, reject) => {
      const sprites = {
        'praise': this.sprites['praise'],
        'scold': this.sprites['scold'],
        'skip': this.sprites['skip'],
      };
      const labels = {
        'praise': new Label('ほめる'),
        'scold': new Label('しかる'),
        'skip': new Label('スキップ'),
      };
      this.studyView = new StudyView();
      resolve(this.studyView.initialize(sprites, labels, {}));
    }).then(() => {
      return Promise.resolve(initialInformation);
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
    }).then(()=>{
      return Promise.resolve(initialInformation);
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
        y: 0.01 * Conf.main.width,
        width: 0.25 * Conf.main.width,
        interval: 0.04 * Conf.main.width,
        color: 'white',
        font: '36px sans-serif'
      };
      this.informationView = new InformationView();
      resolve(this.informationView.initialize({}, labels, properties));
    }).then(()=>{
      return Promise.resolve(initialInformation);
    });
  }

  initializeWaitingMessageView(initialInformation) {
    return new Promise((resolve, reject) => {
      const sprites = {
        'black_back': SpriteFactory.getRect(0, 0, Conf.main.width, Conf.main.height, "rgba(0, 0, 0, 0.75)"),
      };
      const labels = {
        'main_info_waiting_save': new Label('学習データをセーブ中です'),
        'sub_info_waiting_save': new Label('少々お待ちください')
      };
      const properties = {
        name: 'waiting_save',
        x: 0.35 * Conf.main.width,
        y: 0.25 * Conf.main.width,
        width: 0.3 * Conf.main.width,
        interval: 0.04 * Conf.main.width,
        color: 'white',
        font: '48px sans-serif'
      };
      this.waitingMessageView = new InformationView();
      resolve(this.waitingMessageView.initialize(sprites, labels, properties));
    }).then(() => {
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
        let xPlace, yPlace, chipPlaceInterval, relativeDealerPositionY;
        const chipSprite = SpriteFactory.getClone(this.sprites['chip']);
        xPlace = commonInterval;
        yPlace = 0.7 * Conf.main.height - 0.69 * Conf.main.height * index;
        if (index === 0) {
          chipPlaceInterval = -1 * chipSprite.height - commonInterval;
          relativeDealerPositionY = -1 * this.sprites['deeler_button'].height - commonInterval;
        } else if (index === 1){
          chipPlaceInterval = this.sprites[player.characterData.getSpriteKey('normal')].height + commonInterval;
          relativeDealerPositionY = chipSprite.height + commonInterval;
        } else {
          chipPlaceInterval = 0;
        }
        const sprites = {};
        //sprites['player_card_' + player.id] = cardSprite;
        sprites['player_bet_chip_' + player.id] = chipSprite;
        if (index === 0) {
          sprites['serif' + player.characterData.name] = this.sprites['fukidashi_shita'];
        } else {
          sprites['serif' + player.characterData.name] = this.sprites['fukidashi_ue'];
        }
        player.characterData.getSpriteData().forEach(data => {
          sprites[data.sprite_key] = this.sprites[data.sprite_key];
        });
        const labels = {};
        labels['player_name_' + player.id] = new Label(player.characterData.displayName);
        labels['player_stack_' + player.id] = new Label('残り：' + player.getStack());
        labels['player_bet_chip_value_' + player.id] = new Label('');
        labels['pot_get_message_' + player.id] = new Label('');
        labels['result_rank' + player.id] = new Label('');
        const properties = {
          'player': player,
          'initial_blind': initialInformation.initial_blind,
          'x_place': xPlace,
          'y_place': yPlace,
          'chip_place_interval': chipPlaceInterval,
          'relative_dealer_position_y': relativeDealerPositionY,
          'common_interval': commonInterval,
          //'angle': angle,
          'short_radius': initialInformation.short_radius,
          'long_radius': initialInformation.long_radius,
          'center_x': initialInformation.center_x,
          'center_y': initialInformation.center_y,
        };
        let playerView;
        if (player.id === Conf.data.player.id) {
          sprites['bet_bar'] = this.sprites['bet_bar'];
          sprites['bet_slider'] = this.sprites['bet_slider'];
          sprites['bet_up_button'] = this.sprites['bet_up_button'];
          sprites['bet_down_button'] = this.sprites['bet_down_button'];
          sprites['fold'] = this.sprites['fold'];
          sprites['call'] = this.sprites['call'];
          sprites['raise'] = this.sprites['raise'];
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
    this.returnToTitleButtonView.showAll();
    this.saveLearnDataButtonView.showAll();
  }

  // ディーラーポジションを決める描画
  decidePositionDraw() {
    let position;
    this.playerViews.forEach(view => {
      view.initialActionDraw();
      if (view.isDealerPosition()) {
        position = view.getDealerPosition();
      }
    });
    this.boardView.decidePositionDraw(position.x, position.y);
  }

  // ボードにカードを表示する
  setCardsDraw(cards) {
    this.boardView.setCardsDraw(cards.map(card => this.sprites['card_trump/' + card.getCardImageName()]));
  }

  // カード配る部分の描画
  dealCardsDraw(allyId, studyMode) {
    this.playerViews.forEach(view => {
      let sprites;
      // マイプレイヤーもしくは学習モードの時はカードをオープンにするやつ
      if (view.getPlayerId() === allyId || studyMode) {
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
      view.showDownDraw();
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

  // 最終的に勝ったかか負けたかの表示
  gameResultDraw(isWin, existNext) {
    if (isWin) {
      this.currentSelectWindow = this.winView;
    } else {
      this.currentSelectWindow = this.loseView;
    }
    this.currentSelectWindow.nextDraw(isWin && existNext);
    this.currentSelectWindow.showFirst();
  }

  saveDraw() {
    this.waitingMessageView.changeMainInfoText('学習データをセーブ中です');
    this.waitingMessageView.changeSubInfoText('少々お待ちください');
    this.waitingMessageView.showFirst();
  }

  saveFinishDraw() {
    this.waitingMessageView.changeMainInfoText('学習データのセーブが完了しました');
    this.waitingMessageView.changeSubInfoText('');
  }

  saveDrawErase() {
    this.waitingMessageView.hideAll();
    this.saveLearnDataButtonView.reset();
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

  studySerifsDraw(id, isPraise) {
    this.playerViews.forEach(view => {
      if (view.getPlayerId() === id || view instanceof MyPlayerView) {
        view.studySerifDraw(isPraise);
      }
    });
  }

  studySerifsDrawErase() {
    this.studyView.resetStudyStatus();
    this.playerViews.forEach(view => {
      view.studySerifDrawErase();
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

  getCurrentStudyAction() {
    return this.studyView.getStudyStatus();
  }

  moveStudyView() {
    const myPlayerView = this.getMyPlayerView();
    if (myPlayerView !== null) {
      myPlayerView.hidePokerHud();
    }
    this.studyView.showFirst();
  }

  eraseStudyView() {
    const myPlayerView = this.getMyPlayerView();
    this.studyView.hideAll();
    if (myPlayerView !== null) {
      myPlayerView.showPokerHud();
    }
  }

  getCurrentBetValue() {
    const myPlayerView = this.getMyPlayerView();
    if (myPlayerView !== null) {
      return myPlayerView.getCurrentBetValue();
    }
    return 0;
  }

  setCallValue(callValue) {
    const myPlayerView = this.getMyPlayerView();
    if (myPlayerView !== null) {
      myPlayerView.setCallValue(callValue);
    }
  }

  setPlayerBetValue() {
    const myPlayerView = this.getMyPlayerView();
    if (myPlayerView !== null) {
      myPlayerView.setPlayerBetValue();
    }
  }

  playActionSound(action) {
    switch(action) {
      case TexasHoldemAction.ACTION_ALLIN:
      case TexasHoldemAction.ACTION_RAISE:
        this.sounds['raise'].play();
        return;
      case TexasHoldemAction.ACTION_CALL:
        this.sounds['call'].play();
        return;
      //TODO se変更
      case TexasHoldemAction.ACTION_CHECK:
        this.sounds['call'].play();
        return;
      case TexasHoldemAction.ACTION_FOLD:
        this.sounds['fold'].play();
        return;
    }
  }

  playStudySound(studyStatus) {
    switch(studyStatus) {
      case MachineStudy.STUDY_PRAISE:
        this.sounds['praise'].play();
        return;
      case MachineStudy.STUDY_SCOLD:
        this.sounds['scold'].play();
        return;
      case MachineStudy.STUDY_SKIP:
        this.sounds['skip'].play();
        return;
    }
  }

  setPhaseInformation(phase) {
    this.informationView.changeMainInfoText('現フェーズ：' + phase);
  }

  setSubInformation(text) {
    this.informationView.changeSubInfoText(text);
  }

  resetOneAction() {
    const myPlayerView = this.getMyPlayerView();
    if (myPlayerView !== null) {
      myPlayerView.resetAction();
    }
  }

  getMyPlayerView() {
    const myPlayerViews = this.playerViews.filter(view => view instanceof MyPlayerView);
    return myPlayerViews.length === 0 ? null : myPlayerViews[0];
  }

  resetOnePhase() {
    const myPlayerView = this.getMyPlayerView();
    if (myPlayerView !== null) {
      myPlayerView.resetOnePhase();
    }
  }

  isReturnToTitle() {
    return this.returnToTitleButtonView.isClicked();
  }

  isSaveLearnData() {
    return this.saveLearnDataButtonView.isClicked();
  }

  resetBoard() {
    this.boardView.reset();
  }

  getCurrentAction() {
    const myPlayerView = this.getMyPlayerView();
    if (myPlayerView !== null) {
      return myPlayerView.getCurrentAction();
    }
    return BaseAction.ACTION_NONE;
  }
}
