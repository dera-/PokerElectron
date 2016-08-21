import ObjectView from '../../ObjectView';
import SpriteFactory from '../../../factory/SpriteFactory';
import * as CharacterExpression from '../../../const/data/CharacterExpression';

export default class CharacterView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.characterData = elements.characterData;
      this.expression = CharacterExpression.EXPRESSION_NORMAL;
      this.centerX = elements.center_x;
      this.centerY = elements.center_y;
      elements.characterData.getSpriteData().forEach(data => {
        this.initializeSprite(data.sprite_key, elements.x, elements.y);
      });
      this.initializeLabel(
        'serif' + elements.characterData.name,
        this.sprites['serif' + elements.characterData.name].x + 0.05 * this.sprites['serif' + elements.characterData.name].width,
        this.sprites['serif' + elements.characterData.name].y + 0.3 * this.sprites['serif' + elements.characterData.name].height,
        '32px sans-serif',
        'black'
      );
      resolve();
    });
  }

  showFirst() {
    this.curretExpressionDraw();
  }

  curretExpressionDraw() {
    this.hideAllExpressions();
    this.showSprite(this.characterData.getSpriteKey(this.expression));
  }

  changeExpressionByResult(isWin) {
    if (isWin) {
      this.expression = CharacterExpression.EXPRESSION_HAPPY;
    } else {
      this.expression = CharacterExpression.EXPRESSION_SAD;
    }
    this.curretExpressionDraw();
  }

  repositExpression() {
    this.expression = CharacterExpression.EXPRESSION_NORMAL;
    this.curretExpressionDraw();
  }

  hideAllExpressions() {
    this.characterData.getSpriteData().forEach(data => {
      this.hideSprite(data.sprite_key);
    });
  }

  showSerifWhenStudy(isPraise) {
    let serif;
    if (isPraise) {
      serif = this.characterData.serifs.praise;
    } else {
      serif = this.characterData.serifs.scold;
    }
    if (typeof serif === "undefined") {
      return;
    }
    this.showSerif(serif);
  }

  showSerif(serif) {
    this.labels['serif' + this.characterData.name].text = serif;
    this.showSprite('serif' + this.characterData.name);
    this.showLabel('serif' + this.characterData.name);
  }

  hideSerif() {
    this.repositExpression();
    this.labels['serif' + this.characterData.name].text = '';
    this.hideSprite('serif' + this.characterData.name);
    this.hideLabel('serif' + this.characterData.name);
  }

  getCharaSpriteWidth() {
    return this.sprites[this.characterData.getSpriteKey('normal')].width;
  }

  getCharaSpriteHeight() {
    return this.sprites[this.characterData.getSpriteKey('normal')].height;
  }
}
