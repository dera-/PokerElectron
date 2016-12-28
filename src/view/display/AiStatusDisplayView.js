import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/display/sprites.json';
import BgmsConfig from '../../config/display/bgms.json';
import SoundsConfig from '../../config/display/sounds.json';
import SceneRepository from '../../repository/SceneRepository';

const NONE_POKER_STYLE = 'None';

export default class AiStatusDisplayView extends BaseView {
  initializeAiStatusDisplayView(player) {
    return this.initialize(SpritesConf.images, BgmsConfig.bgms[0].path, SoundsConfig.sounds).then(() => {
      return this.initializeProperties(player);
    }).then(() => {
      return this.initializeLabels();
    }).then(() =>{
      return this.initializeEvents()
    });
  }

  initializeProperties(player) {
    return new Promise((resolve, reject) => {
      this.player = player;
      this.returnToTitleFlag = false;
      resolve();
    });
  }

  initializeLabels() {
    return new Promise((resolve, reject) => {
      const width = Conf.main.width;
      const height = Conf.main.height;
      this.labels = {};
      this.labels['ai_name'] = this.getValueLabel(0.45 * width, 0.05 * height, this.player.characterData.displayName);
      this.labels['player_type_section'] = this.getSectionLabel('プレイスタイル：', 0.45 * width, 0.15 * height);
      this.labels['player_type_value'] = this.getValueLabel(0.6 * width, 0.2 * height, NONE_POKER_STYLE);
      this.labels['player_type_value'].width = 0.25 * width;
      this.labels['teached_count_section'] = this.getSectionLabel('教えた数：', 0.45 * width, 0.3 * height);
      this.labels['teached_count_value'] = this.getValueLabel(0.6 * width, 0.35 * height, '0回');
      this.labels['winning_rate_section'] = this.getSectionLabel('ポッド獲得率：', 0.45 * width, 0.45 * height);
      this.labels['winning_rate_value'] = this.getValueLabel(0.6 * width, 0.5 * height, '0%');
      this.labels['right_fold_rate_section'] = this.getSectionLabel('正しいフォールド率：', 0.45 * width, 0.6 * height);
      this.labels['right_fold_rate_value'] = this.getValueLabel(0.6 * width, 0.65 * height, '0%');
      this.labels['favorite_hand_section'] = this.getSectionLabel('好きなハンド：', 0.45 * width, 0.75 * height);
      resolve();
    });
  }

  getSectionLabel(text, x, y) {
    return this.getLabel(text, x, y, '32px sans-serif', 'white');
  }

  getValueLabel(x, y, value = '') {
    return this.getLabel(value, x, y, '54px sans-serif', 'white');
  }

  getLabel(text, x, y, font, color) {
    const label = new Label(text);
    label.moveTo(x, y);
    label.font = font;
    label.color = color;
    return label;
  }

  initializeEvents() {
    return new Promise((resolve, reject) => {
      this.sprites['return_to_title'].addEventListener('touchend',() => {
        this.returnToTitleFlag = true;
      });
      resolve();
    });
  }

  show() {
    SceneRepository.addEntityToCurrentScene('display_background', this.sprites['display_background']);
    SceneRepository.addEntityToCurrentScene('ai_character', this.sprites['ai_character']);
    SceneRepository.addEntityToCurrentScene('return_to_title', this.sprites['return_to_title']);
    Object.keys(this.labels).forEach(key => {
      SceneRepository.addEntityToCurrentScene(key, this.labels[key]);
    });
  }

  isReturnToTitle() {
    return this.returnToTitleFlag;
  }

  setPlayerType(style) {
    if (style === '') {
      this.labels['player_type_value'].text = NONE_POKER_STYLE;
    } else {
      this.labels['player_type_value'].text = style;
    }
  }

  setTeachedCount(value) {
    this.labels['teached_count_value'].text = value + '回';
  }

  setWinningRate(value) {
    this.labels['winning_rate_value'].text = value + '%';
  }

  setRightFoldRate(value) {
    this.labels['right_fold_rate_value'].text = value + '%';
  }

  cardSpriteDraw(cards) {
    const cardSpriteKeys = ['display_card_trump/' + cards[0].getCardImageName(), 'display_card_trump/' + cards[1].getCardImageName()];
    const interval = 0.08 * Conf.main.width;
    let index = 0;
    cardSpriteKeys.forEach(key => {
      this.sprites[key].x = 0.6 * Conf.main.width + index * interval;
      this.sprites[key].y = 0.75 * Conf.main.height;
      SceneRepository.addEntityToCurrentScene(key, this.sprites[key]);
      index++;
    });
  }

}