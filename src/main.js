import GameRepository from './repository/GameRepository.js';

enchant();
window.onload = () => {
  GameRepository.initialize();
};
