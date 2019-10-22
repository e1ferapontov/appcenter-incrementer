const axios = require('axios');
const moment = require('moment');

const ORG = '';
const APP = '';
const BRANCH = '';
const AUTH_TOKEN = '';

const api = axios.create({
  baseURL: `https://api.appcenter.ms/v0.1/apps/${ORG}/${APP}`,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Token': AUTH_TOKEN,
  },
});

const startBuild = async () => {
  return api
    .post(`branches/${BRANCH}/builds`)
    .then(({ data: { buildNumber } }) => {
      return buildNumber;
    })
    .catch((err) => {
      throw err;
    });
};
const cancelBuild = async (buildID) => {
  return api
    .patch(`builds/${buildID}`, { status: 'cancelling' })
    .catch((err) => {
      throw err;
    });
};


const incrementer = async (targetID, verbose) => {
  if (!targetID) {
    throw new Error('provide target build id!');
  }

  verbose && console.log('### will increment till build id is', targetID);

  let current = 0;
  const start = Date.now();

  while (current <= targetID) {
    try {
      const id = await startBuild();
      await cancelBuild(id);
      current = Number.parseInt(id, 10);
    } catch (e) {
      verbose && console.warn('### error occured: ', e);
      throw e;
    }
    verbose && console.log(`### step ${current} of ${targetID}`);
  }

  const end = Date.now();
  const duration = moment.duration(end - start).humanize();

  return {
    current,
    duration,
  };
};

process.on('message', async ({ i, targetID, verbose }) => {
  console.log('running worker #', i);
  const { current, duration } = await incrementer(Number.parseInt(targetID, 10), verbose);

  process.send({ current, duration });
  process.exit(0);
});
