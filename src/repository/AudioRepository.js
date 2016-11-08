import GameRepository from './GameRepository';
import Conf from '../config/conf.json';

const loadedAudioPathSets = new Set();
const AUDIO_DIRECTORY_PATH = 'audio/';

export default class AudioRepository {
  static async getAudioWithPromise(audioPath) {
    if (!loadedAudioPathSets.has(audioPath)) {
      await AudioRepository.loadAudio(audioPath);
    }
    return GameRepository.get().assets[AUDIO_DIRECTORY_PATH + audioPath];
  }

  static async loadAudio(audioPath) {
    return new Promise(resolve => {
      GameRepository.get().load(AUDIO_DIRECTORY_PATH + audioPath, () => {
        loadedAudioPathSets.add(audioPath);
        resolve();
      });
    });
  }
}
