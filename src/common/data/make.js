/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/no-var-requires */

// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../.env' }); // eslint-disable-line
const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');
const makeCommonNameMap = require('./extractCommonNames');
const optimise = require('./optimise');

const UKSIListID = 15;

const FETCH_LIMIT = 50000;

const warehouseURL = 'https://warehouse1.indicia.org.uk';
const websiteURL = 'https://irecord.org.uk';

async function getToken() {
  const clientId = process.env.APP_BACKEND_CLIENT_ID;
  const clientPass = process.env.APP_BACKEND_CLIENT_PASS;
  if (!clientId || !clientPass) {
    return Promise.reject(
      new Error(
        'Requires a website client id and secret set as APP_BACKEND_CLIENT_ID and APP_BACKEND_CLIENT_PASS'
      )
    );
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientPass);

  const options = {
    method: 'post',
    url: `${websiteURL}/oauth/token`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: params,
  };

  const res = await axios(options);
  return res.data.access_token;
}

async function fetch() {
  console.log('Pulling all the species from remote report.');

  const token = await getToken();
  const data = [];
  let offset = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const options = {
      url: `${warehouseURL}/index.php/services/rest/reports/library/taxa/taxa_list_for_app.xml?taxon_list_id=${UKSIListID}&limit=${FETCH_LIMIT}&offset=${offset}`,
      headers: {
        Authorization: `Bearer ${token}`,
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
