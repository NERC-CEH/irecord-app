import fs from 'fs';
import {
  GENUS_ID_INDEX,
  GENUS_NAMES_INDEX,
  GENUS_SPECIES_INDEX,
  SPECIES_ID_INDEX,
  SPECIES_NAMES_INDEX,
} from './constants';

function saveMapToFile(ids: any) {
  return new Promise((resolve, reject) => {
    console.log(`Writing ./species_ids.data.json`);
    fs.writeFile(`./species_ids.data.json`, JSON.stringify(ids), err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(ids);
    });
  });
}

export default async (species: any[]) => {
  const warehouseIdMap: Record<string, any> = {};

  species.forEach((speciesEntry: any) => {
    if (speciesEntry[GENUS_NAMES_INDEX]) {
      warehouseIdMap[speciesEntry[GENUS_ID_INDEX]] =
        speciesEntry[GENUS_NAMES_INDEX];
    }

    const speciesArray = speciesEntry[GENUS_SPECIES_INDEX] || [];
    speciesArray.forEach((sp: any) => {
      warehouseIdMap[sp[SPECIES_ID_INDEX]] = sp[SPECIES_NAMES_INDEX];
    });
  });

  await saveMapToFile(warehouseIdMap);

  return species;
};
