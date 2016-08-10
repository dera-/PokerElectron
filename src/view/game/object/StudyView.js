import ObjectView from '../../ObjectView';
import * as MachineStudy from '../../../const/game/learn/MachineStudy';

export default class StudyView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.studyStatus = MachineStudy.STUDY_NONE;
      console.log('study_initialize1');
      resolve();
    }).then(() => {
      console.log('study_initialize_sprite');
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
