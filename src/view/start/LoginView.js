import BaseView from '../BaseView';
import Conf from '../../config/conf.json';
import SpritesConf from '../../config/login/sprites.json';
import SoundsConfig from '../../config/login/sounds.json';
import * as MODE from '../../const/start/Mode';
import SceneRepository from '../../repository/SceneRepository';
import UserRepository from '../../repository/UserRepository';

export default class LoginView extends BaseView {
  async initializeLoginView(name = '') {
    this.isRegistered = name !== '' ? true : false;
    this.isWaitingAction = false;
    this.decidedMode = MODE.NOT_DICIDED;
    await this.initialize(SpritesConf.images, '', SoundsConfig.sounds);
    await this.initializeComponents(name);
    await this.initializeEvents();
  }

  initializeComponents(name) {
    return new Promise((resolve) => {
      this.labels = {};
      this.labels['login_user'] = this.getLabel('ユーザー名： ', 0.1 * Conf.main.width, 0.1 * Conf.main.height, '32px sans-serif', 'white');
      this.labels['login_code'] = this.getLabel('シリアルコード： ', 0.1 * Conf.main.width, 0.3 * Conf.main.height, '32px sans-serif', 'white');
      this.labels['result'] = this.getLabel('', 0.3 * Conf.main.width, 0.7 * Conf.main.height, '28px sans-serif', 'white');
      this.labels['result'].width = 0.45 * Conf.main.width;

      if (this.isRegistered) {
        this.labels['login_user'].text += name;
        this.labels['login_user'].width = 0.35 * Conf.main.width;
        this.labels['login_code'].text += '*************';
        this.labels['login_code'].width = 0.35 * Conf.main.width;
      } else {
        this.labels['login_user_input'] = this.generateInputForm('login_user_input', 0.45 * Conf.main.width, 0.1 * Conf.main.height);
        this.labels['login_code_input'] = this.generateInputForm('login_code_input', 0.45 * Conf.main.width, 0.3 * Conf.main.height);
      }
      resolve();
    });
  }

  getLabel(text, x, y, font, color) {
    const label = new Label(text);
    label.moveTo(x, y);
    label.font = font;
    label.color = color;
    return label;
  }

  generateInputForm(name, x, y) {
    const input = new Entity();
    input.x = x;
    input.y = y;
    input.width = 0.3 * Conf.main.width;
    input.height = 0.05 * Conf.main.height;
    input._element = document.createElement('input');
    input._element.setAttribute("name", name);
    input._element.setAttribute("type", "text");
    return input;
  }

  initializeEvents() {
    return new Promise((resolve) => {
      this.sprites['login_button'].addEventListener('touchend',() => {
        if (this.isWaitingAction) {
          this.labels['result'].text = 'サーバーと通信中です。少々お待ちください。';
          return;
        }
        if (UserRepository.isLogin()) {
          this.labels['result'].text = 'ログイン済みです。';
          return;
        }
        this.sounds['decide'].play();
        if (this.isRegistered) {
          this.decidedMode = MODE.LOGIN;
        } else {
          this.decidedMode = MODE.REGISTER;
        }
        this.isWaitingAction = true;
      });
      this.sprites['return_to_title'].addEventListener('touchend',() => {
        if (this.isWaitingAction) {
          return;
        }
        this.sounds['exit'].play();
        this.decidedMode = MODE.TITLE;
      });
      resolve();
    });
  }

  show() {
    Object.keys(this.sprites).forEach(key => {
      SceneRepository.addEntityToCurrentScene(key, this.sprites[key]);
    });
    Object.keys(this.labels).forEach(key => {
      SceneRepository.addEntityToCurrentScene(key, this.labels[key]);
    });
  }

  drawResult(isOk) {
    if (isOk) {
      this.labels['result'].text = 'ログイン成功。タイトル画面から「ネットAI対戦」が選べます';
    } else {
      this.labels['result'].text = 'ログイン失敗。。';
      if (false === this.isRegistered) {
        this.labels['result'].text += 'ユーザー名が不正もしくはシリアルコードが間違っています';
      }
    }
  }

  getLoginName() {
    return this.isRegistered ? '' : this.labels['login_user_input']._element.value;
  }

  getLoginCode() {
    return this.isRegistered ? '' : this.labels['login_code_input']._element.value;
  }

  getCurrentAction() {
    return this.decidedMode;
  }

  finishAction() {
    this.isWaitingAction = false;
  }

  resetCurrentAction() {
    this.decidedMode = MODE.NOT_DICIDED;
  }
}
