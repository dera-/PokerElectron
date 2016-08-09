const EXPRESSIONS = ['normal', 'happy', 'sad'];
const SPRITE_KEY_PREFIX = 'chara_';

export default class CharacterData {
  constructor(data) {
    this.name = data.name;
    this.image = data.image;
    this.type = data.type;
    this.serif = data.serif;
  }

  getSpriteData() {
    return EXPRESSIONS.map(expression => {
      return {
        'sprite_key': SPRITE_KEY_PREFIX + this.name + '_' + expression,
        'image_path': this.image + '_' + expression + '.png'
      }
    });
  }
}
