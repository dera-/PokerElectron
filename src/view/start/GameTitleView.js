import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/start/sprites.json';
import SerifsConf from '../../config/start/serifs.json';
import BgmsConfig from '../../config/start/bgms.json';
import SoundsConfig from '../../config/start/sounds.json';
import * as MODE from '../../const/start/Mode';
import SceneRepository from '../../repository/SceneRepository';
import UserRepository from '../../repository/UserRepository';

export default class GameTitleView extends BaseView {
  async initializeGameTitleView() {
    this.decidedMode = MODE.NOT_DICIDED;
    await this.initialize(SpritesConf.images, BgmsConfig.bgms[0].path, SoundsConfig.sounds);
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

      this.labels['login_info'] = new Label();
      this.labels['login_info'].moveTo(
        0.80 * Conf.main.width,
        0.015 * Conf.main.height
      );
      this.labels['login_info'].width = 0.18 * Conf.main.width;
      this.labels['login_info'].font = '32px sans-serif';
      this.labels['login_info'].color = 'white';

      this.labels['error_info'] = new Label();
      this.labels['error_info'].moveTo(
        0.70 * Conf.main.width,
        0.007 * Conf.main.height
      );
      this.labels['error_info'].width = 0.28 * Conf.main.width;
      this.labels['error_info'].font = '32px sans-serif';
      this.labels['error_info'].color = 'white';

      resolve();
    });
  }

  initializeEvents() {
    return new Promise((resolve, reject) => {
      this.sprites['mode_random_ai_battle'].addEventListener('touchend',() => {
        this.sounds['decide'].play();
        this.decidedMode = MODE.RANDOM_AI_BATTLE;
      });
      this.sprites['mode_login'].addEventListener('touchend',() => {
        this.sounds['decide'].play();
        this.decidedMode = MODE.LOGIN;
      });
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
      if (key !== 'mode_random_ai_battle' || UserRepository.getUserAccessToken() !== '') {
        SceneRepository.addEntityToCurrentScene(key, this.sprites[key]);
      }
    });
    Object.keys(this.labels).forEach(key => {
      SceneRepository.addEntityToCurrentScene(key, this.labels[key]);
    });
  }

  showLoginInfo(isLogin) {
    if (isLogin) {
      this.labels['login_info'].text = 'ログイン中です';
    } else {
      this.labels['login_info'].text = '現在非ログイン状態です';
    }
  }

  showError(type) {
    switch (type) {
      case 'session':
        this.labels['error_info'].text = 'セッションが切れました。再ログインしてください。';
        break;
      default:
        this.labels['error_info'].text = 'システムエラーです。';
        break;
    }
  }

  getCurrentAction() {
    return this.decidedMode;
  }
}
