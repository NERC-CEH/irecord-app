/* eslint-disable import-x/no-extraneous-dependencies */
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import camelCase from 'lodash/camelCase';
import mapKeys from 'lodash/mapKeys';
import { z, object } from 'zod';
import makeCommonNameMap from './extractCommonNames';
import makeWarehouseIdMap from './extractWarehouseIds';
import optimise from './optimise';

dotenv.config({ path: '../../../.env' });

const remoteSchema = object({
  id: z.string(),
  taxonGroup: z.string(),
  taxon: z.string(),
  commonName: z.string().optional(),
  cym: z.string().optional(),
  synonym: z.string().optional(),
}).passthrough();

export type RemoteAttributes = z.infer<typeof remoteSchema>;

const UKSIListID = 15;

const FETCH_LIMIT = 50000;

const warehouseURL = 'https://warehouse1.indicia.org.uk';

const { ANON_WAREHOUSE_TOKEN } = process.env;
if (!ANON_WAREHOUSE_TOKEN) {
  throw new Error('ANON_WAREHOUSE_TOKEN is missing from env.');
}

async function fetch(): Promise<RemoteAttributes[]> {
  console.log('Pulling all the species from remote report.');

  const data: Record<string, unknown>[] = [];
  let offset = 0;

  while (true) {
    const options = {
      url: `${warehouseURL}/index.php/services/rest/reports/library/taxa/taxa_list_for_app.xml?taxon_list_id=${UKSIListID}&limit=${FETCH_LIMIT}&offset=${offset}`,
      headers: {
        Authorization: `Bearer ${ANON_WAREHOUSE_TOKEN}`,
      },
    };

    // eslint-disable-next-line no-await-in-loop
    const res = await axios<{ data: Record<string, unknown>[] }>(options);

    if (!res.data.data?.length) break;

    data.push(...res.data.data);

    offset += FETCH_LIMIT;
  }

  console.log(`Pulled ${data.length} species`);

  const getValues = (doc: Record<string, unknown>) =>
    mapKeys(doc, (_, key) => (key.includes(':') ? key : camelCase(key)));

  const docs = data.map(getValues).map(doc => remoteSchema.parse(doc));
  docs.sort((first, second) => first.taxon.localeCompare(second.taxon));

  return docs;
}

function saveSpeciesToFile<T>(species: T) {
  return new Promise<T>((resolve, reject) => {
    console.log('Writing ./species.data.json');

    fs.writeFile('./species.data.json', JSON.stringify(species), err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(species);
    });
  });
}

function saveCommonNamesToFile<T>(commonNames: T) {
  return new Promise<T>((resolve, reject) => {
    console.log('Writing ./species_names.data.json');
    fs.writeFile(
      './species_names.data.json',
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
  .then(optimise)
  .then(saveSpeciesToFile)
  .then(makeWarehouseIdMap)
  .then(makeCommonNameMap)
  .then(saveCommonNamesToFile)
  .then(() => console.log('All done!'));
