import ObjectView from '../../ObjectView';
import * as MachineStudy from '../../../const/game/learn/MachineStudy';

export default class StudyView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.studyStatus = MachineStudy.STUDY_NONE;
      Object.keys(this.sprites).forEach(key => {
        this.initializeLabel(
          key,
          this.sprites[key].x + 0.1 * this.sprites[key].width,
          this.sprites[key].y + 0.25 * this.sprites[key].height,
          '36px sans-serif',
          'white'
        );
      });
      resolve();
    }).then(() => {
      return this.initializeSpriteEvents();
    }).then(()=>{
      return Promise.resolve();
    });
  }

  initializeSpriteEvents() {
    return new Promise((resolve, reject) => {
      console.log('initializeSpriteEvents');
      this.sprites['praise'].addEventListener('touchend', () => {
        this.studyStatus = MachineStudy.STUDY_PRAISE;
      });
      this.sprites['scold'].addEventListener('touchend', () => {
        this.studyStatus = MachineStudy.STUDY_SCOLD;
      });
      this.sprites['skip'].addEventListener('touchend', () => {
        this.studyStatus = MachineStudy.STUDY_SKIP;
      });
      resolve();
    });
  }

  showFirst() {
    this.studyStatus = MachineStudy.STUDY_NONE;
    this.showAll();
  }

  getStudyStatus() {
    return this.studyStatus;
  }
}
