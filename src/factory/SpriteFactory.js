import GameRepository from '../repository/GameRepository';
import ImageRepository from '../repository/ImageRepository';

export default class SpriteFactory {
  static generate(x, y, width, height, imagePath, events) {
    const sprite = new Sprite(width, height);
    sprite.x = x;
    sprite.y = y;
    if (false === ImageRepository.isLoaded()) {
      ImageRepository.setImage(imagePath);
    }
    sprite.image = ImageRepository.getImage(imagePath);
    Object.keys(events).forEach(eventName => {
      sprite.addEventListener(eventName, events[eventName]);
    });
    return sprite;
  }
}
