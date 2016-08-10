import * as CharacterExpression from '../../const/data/CharacterExpression';

const SPRITE_KEY_PREFIX = 'chara_';

export default class CharacterData {
  constructor(data) {
    this.name = data.name;
    this.image = data.image;
    this.type = data.type;
    this.serif = data.serif;
  }

  getSpriteData() {
    return CharacterExpression.ALL_EXPRESSIONS.map(expression => {
      return {
        'sprite_key': SPRITE_KEY_PREFIX + this.name + '_' + expression,
        'image_path': this.image + '_' + expression + '.png'
      }
    });
  }

  getSpriteKey(expression) {
    return SPRITE_KEY_PREFIX + this.name + '_' + expression;
  }
}
