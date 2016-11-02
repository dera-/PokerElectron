import TexasHoldemSimulationScene from './scene/TexasHoldemSimulationScene';

if (process.argv.length !== 6) {
 console.log('node exec-learn-simulation enemyName simulationCount initialBigBlind initialStack');
} else {
  const scene = new TexasHoldemSimulationScene(
    process.argv[2],
    process.argv[3],
    process.argv[4],
    process.argv[5]
  );
  scene.run();
}