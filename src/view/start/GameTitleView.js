import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/start/sprites.json';
import SerifsConf from '../../config/start/serifs.json';
import SoundsConfig from '../../config/start/sounds.json';
import * as MODE from '../../const/start/Mode';
import SceneRepository from '../../repository/SceneRepository';

export default class GameTitleView extends BaseView {
  async initializeGameTitleView() {
    this.decidedMode = MODE.NOT_DICIDED;
    await this.initialize(SpritesConf.images, '', SoundsConfig.sounds);
    await this.initializeLabels();
    await this.initializeEvents();
  }

  initializeLabels() {
    return new Promise((resolve, reject) => {
      this.labels = {};
      this.labels['title_serif'] = new Label();
      this.labels['title_serif'].moveTo(
        0.05 * Conf.main.width,
        0.35 * Conf.main.height
      );
      this.labels['title_serif'].font = '28px sans-serif';
      this.labels['title_serif'].color = 'white';
      resolve();
    });
  }

  initializeEvents() {
    return new Promise((resolve, reject) => {
      this.sprites['mode_study'].addEventListener('touchend',() => {
        this.sounds['decide'].play();
        this.decidedMode = MODE.STUDY;
      });
      this.sprites['mode_battle'].addEventListener('touchend',() => {
        this.sounds['decide'].play();
        this.decidedMode = MODE.BATTLE;
      });
      this.sprites['mode_ai_battle'].addEventListener('touchend',() => {
        this.sounds['decide'].play();
        this.decidedMode = MODE.AI_BATTLE;
      });
      this.sprites['mode_ai_status'].addEventListener('touchend',() => {
        this.sounds['decide'].play();
        this.decidedMode = MODE.AI_STATUS;
      });
      this.sprites['mode_exit'].addEventListener('touchend',() => {
        this.sounds['exit'].play();
        this.decidedMode = MODE.EXIT;
      });
      resolve();
    });
  }

  resetDicidedMode() {
    this.decidedMode = MODE.NOT_DICIDED;
    this.labels['title_serif'].text = '';
  }

  show() {
    Object.keys(this.sprites).forEach(key => {
      SceneRepository.addEntityToCurrentScene(key, this.sprites[key]);
    });
  }

  getCurrentAction() {
    return this.decidedMode;
  }
}
