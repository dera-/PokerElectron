import GameRepository from '../repository/GameRepository';
import ImageRepository from '../repository/ImageRepository';

export default class SpriteFactory {
  static generateWithPromise(x, y, imagePath) {
    return ImageRepository.getImageWithPromise(imagePath).then((image) => {
      const sprite = new Sprite(image.width, image.height);
      sprite.x = x;
      sprite.y = y;
      sprite.image = image;
      //sprite.scale(1.0 * width / image.width, 1.0 * height / image.height);
      //console.log(imagePath + ": x:" + sprite.x + ", y:" + sprite.y + ', originalX:' + x +', originalY:' + y);
      return sprite;
    });
  }

  static getRect(x, y, width, height, fillStyle) {
    const sprite = new Sprite(width, height);
    const surface = new Surface(width, height);
    surface.context.beginPath();
    surface.context.fillStyle = fillStyle;
    surface.context.fillRect(x, y, width, height);
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
