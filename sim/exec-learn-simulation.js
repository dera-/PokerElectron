import 'babel-polyfill';
import TexasHoldemSimulationScene from './scene/TexasHoldemSimulationScene';

if (process.argv.length !== 6) {
 console.log('node exec-learn-simulation enemyName simulationCount initialBigBlind initialStack');
} else {
  const scene = new TexasHoldemSimulationScene(
    process.argv[2],
    parseInt(process.argv[3], 10),
    parseInt(process.argv[4], 10),
    parseInt(process.argv[5], 10)
  );
  scene.run();
}