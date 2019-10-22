const { fork } = require('child_process');
const numchild  = require('os').cpus().length;

const parallel = () => {
  const targetID = process.argv[2];
  const verbose = process.argv.some(arg => arg === '--verbose');

  console.log(`spawning ${numchild} workers...`);
  console.log('target ID:', targetID, '\n');

  let i = 0;
  while (i < numchild) {
    const child = fork('incrementer');
    child.send({ i, targetID, verbose });
    child.on('message', ({ current, duration }) => {
      console.log(`worker #${i} exited after ${duration} with final ID #${current}`);
    });
    i += 1;
  }

  return 0;
};

parallel();
