import ObjectView from '../../ObjectView';
import SpriteFactory from '../../../factory/SpriteFactory';
import * as CharacterExpression from '../../../const/data/CharacterExpression';

export default class CharacterView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.characterData = elements.characterData;
      this.expression = CharacterExpression.EXPRESSION_NORMAL;
      Object.keys(this.sprites).forEach(key => {
        this.initializeSprite(key, elements.x, elements.y);
      });
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
}
