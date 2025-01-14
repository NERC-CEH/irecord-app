/* eslint-disable @typescript-eslint/no-var-requires */
import taxonCleaner from './clean';
import {
  GENUS_ID_INDEX,
  GENUS_GROUP_INDEX,
  GENUS_TAXON_INDEX,
  GENUS_SPECIES_INDEX,
  GENUS_NAMES_INDEX,
  SPECIES_ID_INDEX,
  SPECIES_TAXON_INDEX,
  SPECIES_NAMES_INDEX,
  COMMON_NAMES,
  TAXON,
  GROUP,
  ID,
} from './constants';
import { groups as speciesInformalGroups } from './informalGroups';
import { RemoteAttributes } from './make';

const enableWelsh = process.env.APP_WELSH;

function normalizeValue(value: number) {
  // check if int
  // https://coderwall.com/p/5tlhmw/converting-strings-to-number-in-javascript-pitfalls
  const int = value * 1;
  if (!Number.isNaN(int)) {
    return int;
  }
  return value;
}

function checkAllSpeciesHasInformalGroup(speciesList: any[]) {
  console.log('Checking if all the species has an informal group metadata.');

  const groups = Object.keys(speciesInformalGroups);
  speciesList.forEach((species: any[]) => {
    if (!groups.includes(`${species[GROUP]}`)) {
      throw new Error(`No Such species informal group found ${species[GROUP]}`);
    }
  });
}

const flattenSpeciesReport = (speciesFromReport: RemoteAttributes[]) =>
  speciesFromReport.map(s => {
    const flattened: any = [];
    flattened[ID] = parseInt(s.id, 10);
    flattened[GROUP] = parseInt(s.taxonGroup, 10);
    flattened[TAXON] = s.taxon;

    flattened[COMMON_NAMES] = [];
    // in the order of importance
    if (s.commonName) {
      flattened[COMMON_NAMES].push(s.commonName);
    }
    if (s.synonym) {
      flattened[COMMON_NAMES].push(s.synonym);
    }
    if (enableWelsh && s.cym) {
      flattened[COMMON_NAMES].push(s.cym);
    }

    return flattened;
  });

function addGenus(optimised: any[], taxa: any[]) {
  const taxon = taxonCleaner(taxa[TAXON], false);
  if (!taxon) {
    return;
  }

  const commonNames = taxa[COMMON_NAMES].map((name: any) =>
    taxonCleaner(name, true)
  );

  const genus = [];
  genus[GENUS_ID_INDEX] = taxa[ID];
  genus[GENUS_GROUP_INDEX] = taxa[GROUP];
  genus[GENUS_TAXON_INDEX] = taxon;

  if (commonNames.length) {
    genus[GENUS_SPECIES_INDEX] = []; // optimization to not include the array by default
    genus[GENUS_NAMES_INDEX] = commonNames;
  }

  optimised.push(genus);
}

/**
 * Finds the last genus entered in the optimised list.
 * Looks for the matching taxa and informal group.
 * @param taxa
 * @param taxaNameSplitted
 * @returns {*}
 */
function getLastGenus(
  optimised: any[],
  taxa: any[],
  taxaNameSplitted: any[],
  index?: number | undefined
) {
  const lastEntry = index || optimised.length - 1;
  let lastGenus = optimised[lastEntry];

  // no genus with the same name and group was found
  if (lastGenus?.[TAXON] !== taxaNameSplitted[0]) {
    // create a new genus with matching group
    lastGenus = [0, taxa[GROUP], taxaNameSplitted[0], []];
    optimised.push(lastGenus);
    return lastGenus;
  }

  // if taxa groups don't match then recursively go to check
  // next entry that matches the taxa and the group
  if (lastGenus[GROUP] !== taxa[GROUP]) {
    return getLastGenus(optimised, taxa, taxaNameSplitted, lastEntry - 1);
  }

  return lastGenus;
}

function addSpecies(optimised: any[], taxa: any[][], taxaNameSplitted: any[]) {
  // species that needs to be appended to genus
  const lastGenus = getLastGenus(optimised, taxa, taxaNameSplitted);

  let speciesArray = lastGenus[GENUS_SPECIES_INDEX];
  if (!speciesArray) {
    lastGenus[GENUS_SPECIES_INDEX] = [];
    speciesArray = lastGenus[GENUS_SPECIES_INDEX];
  }

  const id = normalizeValue(taxa[ID] as any);

  const taxon = taxaNameSplitted.slice(1).join(' ');
  const taxonClean = taxonCleaner(taxon, false);
  if (!taxonClean) {
    // cleaner might stripped all
    return;
  }

  const commonNames = taxa[COMMON_NAMES].map((name: any) =>
    taxonCleaner(name, true)
  ).filter((exists: any) => exists);

  const species = [];
  species[SPECIES_ID_INDEX] = id;
  species[SPECIES_TAXON_INDEX] = taxonClean;

  if (commonNames.length) {
    species[SPECIES_NAMES_INDEX] = commonNames;
  }
  speciesArray.push(species);
}

function isGenusDuplicate(
  optimised: string | any[],
  taxa: any[],
  index?: number | undefined
) {
  const lastEntry = index || optimised.length - 1;
  if (lastEntry < 0) {
    // empty array
    return false;
  }
  const genus = optimised[lastEntry];
  if (genus[TAXON] !== taxa[TAXON]) {
    // couldn't find duplicate
    return false;
  }

  if (genus[GROUP] !== taxa[GROUP]) {
    // recursively look for another one down the line
    return isGenusDuplicate(optimised, taxa, lastEntry - 1);
  }
  return true;
}

function withoutTaxon(taxa: any[]) {
  if (!taxa[TAXON]) console.warn(`${taxa[ID]} has no taxon`);
  return !!taxa[TAXON];
}

/**
 * Optimises the array by grouping species to genus.
 */
export default function optimise(speciesFromReport: RemoteAttributes[]) {
  let speciesFlattened = flattenSpeciesReport(speciesFromReport);

  speciesFlattened = speciesFlattened.filter(withoutTaxon);

  checkAllSpeciesHasInformalGroup(speciesFlattened);

  const optimised: never[] = [];

  speciesFlattened.forEach((taxa: any[]) => {
    const taxaName = taxa[TAXON];
    const taxaNameSplitted = taxaName.split(' ');

    // hybrid genus names starting with X should
    // have a full genus eg. X Agropogon littoralis
    if (taxaNameSplitted[0].toLowerCase() === 'x') {
      taxaNameSplitted[0] = `${taxaNameSplitted.shift()} ${
        taxaNameSplitted[0]
      }`;
    }
    if (taxaNameSplitted.length === 1) {
      // genus
      if (isGenusDuplicate(optimised, taxa)) {
        console.warn(`Duplicate genus found: ${taxa.toString()}`);
        return;
      }
      addGenus(optimised, taxa);
      return;
    }

    addSpecies(optimised, taxa, taxaNameSplitted);
  });

  return optimised;
}
