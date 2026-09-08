import fs from 'fs';
import {
  GENUS_ID_INDEX,
  GENUS_NAMES_INDEX,
  GENUS_SPECIES_INDEX,
  SPECIES_ID_INDEX,
  SPECIES_NAMES_INDEX,
} from './constants';
import type { OptimisedSpecies } from './optimise';

function saveMapToFile(ids: Record<string, string[]>) {
  return new Promise<Record<string, string[]>>((resolve, reject) => {
    console.log('Writing ./species_ids.data.json');
    fs.writeFile('./species_ids.data.json', JSON.stringify(ids), err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(ids);
    });
  });
}

export default async (species: OptimisedSpecies) => {
  const warehouseIdMap: Record<string, string[]> = {};

  species.forEach(speciesEntry => {
    if (speciesEntry[GENUS_NAMES_INDEX]) {
      warehouseIdMap[speciesEntry[GENUS_ID_INDEX]] =
        speciesEntry[GENUS_NAMES_INDEX];
    }

    const speciesArray = speciesEntry[GENUS_SPECIES_INDEX] || [];
    speciesArray.forEach(sp => {
      const names = sp[SPECIES_NAMES_INDEX];
      if (names) warehouseIdMap[String(sp[SPECIES_ID_INDEX])] = names;
    });
  });

  await saveMapToFile(warehouseIdMap);

  return species;
};
