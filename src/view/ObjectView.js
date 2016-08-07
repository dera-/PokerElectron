import SceneRepository from '../repository/SceneRepository';

export default class ObjectView {
  initialize(sprites, labels, elements = {}) {
    return new Promise((resolve, reject) => {
      this.sprites = {};
      Object.keys(sprites).forEach(key => {
        this.sprites[key] = sprites[key];
      });
      resolve();
    }).then(() => {
      this.labels = {};
      Object.keys(labels).forEach(key => {
        this.labels[key] = labels[key];
      });
      return Promise.resolve();
    }).then(() => {
      return this.initializeElements(elements);
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
}
