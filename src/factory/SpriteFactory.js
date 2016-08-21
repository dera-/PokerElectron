import GameRepository from '../repository/GameRepository';
import ImageRepository from '../repository/ImageRepository';

export default class SpriteFactory {
  static generateWithPromise(x, y, imagePath) {
    return ImageRepository.getImageWithPromise(imagePath).then((image) => {
      const sprite = new Sprite(image.width, image.height);
      sprite.x = x;
      sprite.y = y;
      sprite.image = image;
      return sprite;
    });
  }

  static generate(x, y, imagePath) {
    const image = ImageRepository.getImage(imagePath);
    const sprite = new Sprite(image.width, image.height);
    sprite.x = x;
    sprite.y = y;
    sprite.image = image;
    return sprite;
  }

  static getRect(x, y, width, height, fillStyle) {
    const sprite = new Sprite(width, height);
    const surface = new Surface(width, height);
    surface.context.beginPath();
    surface.context.fillStyle = fillStyle;
    surface.context.fillRect(0, 0, width, height);
    sprite.x = x;
    sprite.y = y;
    sprite.image = surface;
    return sprite;
  }

  static getClone(sprite) {
    const cloneSprite = new Sprite(sprite.width, sprite.height);
    cloneSprite.x = sprite.x;
    cloneSprite.y = sprite.y;
    cloneSprite.image = sprite.image;
    return cloneSprite;
  }
}
