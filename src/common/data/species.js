// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../.env' }); // eslint-disable-line
const fs = require('fs');
const http = require('https');
const makeCommonNameMap = require('./speciesExtractCommonNames');
const optimise = require('./speciesOptimise');

function fetch() {
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

  return new Promise(resolve => {
    const options = {
      method: 'GET',
      hostname: 'www.brc.ac.uk',
      path:
        '/irecord/api/v1/reports/projects/irecord/taxa/taxa_list_for_app.xml?taxon_list_id=15',
      headers: {
        'x-api-key': apiKey,
        Authorization: `Basic ${basicAuth}`,
        'Cache-Control': 'no-cache',
      },
    };

    const req = http.request(options, res => {
      const chunks = [];

      res.on('data', chunk => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks);
        const json = JSON.parse(body.toString());
        console.log(`Pulled ${json.data.length} species`);
        resolve(json);
      });
    });

    req.end();
  });
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
