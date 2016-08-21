import ObjectView from '../../ObjectView';

export default class InformationView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.name = elements.name;
      this.initializeLabel('main_info_' + this.name, elements.x, elements.y, elements.font, elements.color, elements.width);
      this.initializeLabel('sub_info_' + this.name, elements.x , elements.y + elements.interval, elements.font, elements.color, elements.width);
      resolve();
    });
  }

  showFirst() {
    this.showAll();
  }

  changeMainInfoText(text) {
    this.labels['main_info_' + this.name].text = text;
  }

  changeSubInfoText(text) {
    this.labels['sub_info_' + this.name].text = text;
  }
}
