/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/no-var-requires */

// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../.env' }); // eslint-disable-line
const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');
const makeCommonNameMap = require('./speciesExtractCommonNames');
const optimise = require('./speciesOptimise');

const FETCH_LIMIT = 50000;

async function fetch() {
  console.log('Pulling all the species from remote report.');

  const apiKey = process.env.APP_INDICIA_API_KEY;
  if (!apiKey) {
    return Promise.reject(
      new Error('Requires a website indicia-api key set as APP_INDICIA_API_KEY')
    );
  }

  const basicAuth = process.env.APP_INDICIA_BASIC_AUTH;
  if (!basicAuth) {
    return Promise.reject(
      new Error('Requires a user basic auth key set as APP_INDICIA_BASIC_AUTH')
    );
  }

  const data = [];
  let offset = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const options = {
      url: `https://irecord.org.uk/api/v1/reports/projects/irecord/taxa/taxa_list_for_app.xml?taxon_list_id=15&limit=${FETCH_LIMIT}&offset=${offset}`,
      headers: {
        'x-api-key': apiKey,
        Authorization: `Basic ${basicAuth}`,
        'Cache-Control': 'no-cache',
      },
    };

    // eslint-disable-next-line no-await-in-loop
    const res = await axios(options);

    if (!res.data.data?.length) break;

    data.push(...res.data.data);

    offset += FETCH_LIMIT;
  }

  console.log(`Pulled ${data.length} species`);

  return { data };
}

function saveSpeciesToFile(species) {
  return new Promise((resolve, reject) => {
    console.log(`Writing ./species.data.json`);

    fs.writeFile('./species.data.json', JSON.stringify(species), err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(species);
    });
  });
}

function saveCommonNamesToFile(commonNames) {
  return new Promise((resolve, reject) => {
    console.log(`Writing ./species_names.data.json`);
    fs.writeFile(
      `./species_names.data.json`,
      JSON.stringify(commonNames),
      err => {
        if (err) {
          reject(err);
          return;
        }

        resolve(commonNames);
      }
    );
  });
}

fetch()
  .then(species => optimise(species))
  .then(saveSpeciesToFile)
  .then(makeCommonNameMap)
  .then(saveCommonNamesToFile)
  .then(() => console.log('All done!'));
