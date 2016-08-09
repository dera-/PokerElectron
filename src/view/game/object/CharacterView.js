import ObjectView from '../../ObjectView';
import SpriteFactory from '../../../factory/SpriteFactory';

const EXPRESSIONS = ['normal', 'happy', 'sad'];
const EXPRESSION_NORMAL_INDEX = 0;
const EXPRESSION_HAPPY_INDEX = 1;
const EXPRESSION_SAD_INDEX = 2;
export default class CharacterView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.id = elements.id;
      this.name = elements.name;
      this.expressionIndex = EXPRESSION_NORMAL_INDEX;
      Object.keys(this.sprites).forEach(key => {
        this.initializeSprite(key, elements.x, elements.y);
      });
      resolve();
    });
  }

  showFirst() {
    this.showSprite('chara_' + this.name + '_normal');
  }

  changeExpressionByResult(isWin) {
    this.hideAllExpressions();
    if (isWin) {
      this.expressionIndex = EXPRESSION_HAPPY_INDEX;
    } else {
      this.expressionIndex = EXPRESSION_SAD_INDEX;
    }
    this.showSprite('chara_' + this.name + '_' + EXPRESSIONS[this.expressionIndex]);
  }

  repositExpression() {
    this.hideAllExpressions();
    this.expressionIndex = EXPRESSION_NORMAL_INDEX;
    this.showFirst();
  }

  hideAllExpressions() {
    EXPRESSIONS.forEach(diff => {
      this.hideSprite('chara_' + this.name + '_' + diff);
    });
  }
}
