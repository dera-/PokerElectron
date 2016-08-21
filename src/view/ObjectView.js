import SceneRepository from '../repository/SceneRepository';

export default class ObjectView {
  initialize(sprites, labels, elements = {}) {
    return Promise.resolve().then(() => {
      return this.initializeSprites(sprites, elements);
    }).then(() => {
      return this.initializeLabels(labels, elements);
    }).then(() => {
      return this.initializeElements(elements);
    });
  }

  initializeSprites(sprites, elements) {
    return new Promise((resolve, reject) => {
      this.sprites = {};
      Object.keys(sprites).forEach(key => {
        this.sprites[key] = sprites[key];
      });
      resolve();
    });
  }

  initializeLabels(labels, elements) {
    return new Promise((resolve, reject) => {
      this.labels = {};
      Object.keys(labels).forEach(key => {
        this.labels[key] = labels[key];
      });
      resolve();
    });
  }

  initializeElements(elements) {
    return Promise.resolve();
  }

  addSprite(key, sprite) {
    this.sprites[key] = sprite;
  }

  removeSprite(key) {
    delete this.sprites[key];
  }

  addLabel(key, label) {
    this.labels[key] = label;
  }

  removeLabel(key) {
    delete this.labels[key];
  }

  showFirst() {}

  showAll() {
    Object.keys(this.sprites).forEach(key => {
      this.showSprite(key);
    });
    Object.keys(this.labels).forEach(key => {
      this.showLabel(key);
    });
  }

  hideAll() {
    Object.keys(this.sprites).forEach(key => {
      this.hideSprite(key);
    });
    Object.keys(this.labels).forEach(key => {
      this.hideLabel(key);
    });
  }

  showSprite(key) {
    if (false === this.sprites.hasOwnProperty(key)) {
      return;
    }
    SceneRepository.addEntityToCurrentScene('sprite_' + key, this.sprites[key]);
  }

  hideSprite(key) {
    if (false === this.sprites.hasOwnProperty(key)) {
      return;
    }
    SceneRepository.removeEntityFromCurrentScene('sprite_' + key);
  }

  showLabel(key) {
    if (false === this.labels.hasOwnProperty(key)) {
      return;
    }
    SceneRepository.addEntityToCurrentScene('label_' + key, this.labels[key]);
  }

  hideLabel(key) {
    if (false === this.labels.hasOwnProperty(key)) {
      return;
    }
    SceneRepository.removeEntityFromCurrentScene('label_' + key);
  }

  // spriteを整形
  initializeSprite(key, x, y) {
    if (false === this.sprites.hasOwnProperty(key)) {
      return;
    }
    this.sprites[key].x = x;
    this.sprites[key].y = y;
  }

  // labelを整形
  initializeLabel(key, x, y, font = null, color = null, width = null) {
    if (false === this.labels.hasOwnProperty(key)) {
      return;
    }
    this.labels[key].moveTo(x, y);
    if (font !== null) {
      this.labels[key].font = font;
    }
    if (color !== null) {
      this.labels[key].color = color;
    }
    if (width !== null) {
      this.labels[key].width = width;
    }
  }
}
