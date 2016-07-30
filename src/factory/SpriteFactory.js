import GameRepository from '../repository/GameRepository';
import ImageRepository from '../repository/ImageRepository';

export default class SpriteFactory {
  static generateWithPromise(x, y, width, height, imagePath) {
    return ImageRepository.getImageWithPromise(imagePath).then((image) => {
      const sprite = new Sprite(width, height);
      sprite.x = x;
      sprite.y = y;
      sprite.image = image;
      return sprite;
    });
  }

  static getClone(sprite) {
    const cloneSprite = new Sprite(sprite.width, sprite.height);
    cloneSprite.x = sprite.x;
    cloneSprite.y = sprite.y;
    cloneSprite.image = sprite.image;
    return cloneSprite;
  }
}
