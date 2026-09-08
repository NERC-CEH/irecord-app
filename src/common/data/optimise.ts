import taxonCleaner from './clean';
import {
  GENUS_GROUP_INDEX,
  GENUS_TAXON_INDEX,
  GENUS_SPECIES_INDEX,
  GENUS_NAMES_INDEX,
  SPECIES_NAMES_INDEX,
  COMMON_NAMES,
  TAXON,
  GROUP,
  ID,
} from './constants';
import { groups as speciesInformalGroups } from './informalGroups';
import type { RemoteAttributes } from './make';

const cleanTaxon: (taxon: string, common: boolean) => string | null =
  taxonCleaner;

export type FlatTaxon = [number, number, string, string[]];
export type SpeciesEntry = [number | string, string, string[]?];
export type GenusEntry = [number, number, string, SpeciesEntry[]?, string[]?];
export type OptimisedSpecies = GenusEntry[];

const enableWelsh = process.env.APP_WELSH;

function normalizeValue(value: number | string) {
  const int = Number(value);
  return Number.isNaN(int) ? value : int;
}

function checkAllSpeciesHasInformalGroup(speciesList: FlatTaxon[]) {
  console.log('Checking if all the species has an informal group metadata.');

  const groups = Object.keys(speciesInformalGroups);
  speciesList.forEach(species => {
    if (!groups.includes(`${species[GROUP]}`)) {
      throw new Error(`No Such species informal group found ${species[GROUP]}`);
    }
  });
}

const flattenSpeciesReport = (speciesFromReport: RemoteAttributes[]) =>
  speciesFromReport.map<FlatTaxon>(species => {
    const commonNames = [
      species.commonName,
      species.synonym,
      enableWelsh ? species.cym : undefined,
    ].filter((name): name is string => !!name);

    return [
      parseInt(species.id, 10),
      parseInt(species.taxonGroup, 10),
      species.taxon,
      commonNames,
    ];
  });

function addGenus(optimised: OptimisedSpecies, taxa: FlatTaxon) {
  const taxon = cleanTaxon(taxa[TAXON], false);
  if (!taxon) return;

  const commonNames = taxa[COMMON_NAMES].map(name =>
    cleanTaxon(name, true)
  ).filter((name): name is string => !!name);

  const genus: GenusEntry = [taxa[ID], taxa[GROUP], taxon];
  if (commonNames.length) {
    genus[GENUS_SPECIES_INDEX] = [];
    genus[GENUS_NAMES_INDEX] = commonNames;
  }

  optimised.push(genus);
}

function getLastGenus(
  optimised: OptimisedSpecies,
  taxa: FlatTaxon,
  splitTaxonName: string[],
  index?: number
): GenusEntry {
  const lastEntry = index || optimised.length - 1;
  let lastGenus = optimised[lastEntry];

  if (lastGenus?.[GENUS_TAXON_INDEX] !== splitTaxonName[0]) {
    lastGenus = [0, taxa[GROUP], splitTaxonName[0], []];
    optimised.push(lastGenus);
    return lastGenus;
  }

  if (lastGenus[GENUS_GROUP_INDEX] !== taxa[GROUP]) {
    return getLastGenus(optimised, taxa, splitTaxonName, lastEntry - 1);
  }

  return lastGenus;
}

function addSpecies(
  optimised: OptimisedSpecies,
  taxa: FlatTaxon,
  splitTaxonName: string[]
) {
  const lastGenus = getLastGenus(optimised, taxa, splitTaxonName);

  let speciesArray = lastGenus[GENUS_SPECIES_INDEX];
  if (!speciesArray) {
    speciesArray = [];
    lastGenus[GENUS_SPECIES_INDEX] = speciesArray;
  }

  const taxon = splitTaxonName.slice(1).join(' ');
  const cleanName = cleanTaxon(taxon, false);
  if (!cleanName) return;

  const commonNames = taxa[COMMON_NAMES].map(name =>
    cleanTaxon(name, true)
  ).filter((name): name is string => !!name);

  const species: SpeciesEntry = [normalizeValue(taxa[ID]), cleanName];
  if (commonNames.length) species[SPECIES_NAMES_INDEX] = commonNames;
  speciesArray.push(species);
}

function isGenusDuplicate(
  optimised: OptimisedSpecies,
  taxa: FlatTaxon,
  index?: number
): boolean {
  const lastEntry = index || optimised.length - 1;
  if (lastEntry < 0) return false;

  const genus = optimised[lastEntry];
  if (genus[GENUS_TAXON_INDEX] !== taxa[TAXON]) return false;

  if (genus[GENUS_GROUP_INDEX] !== taxa[GROUP]) {
    return isGenusDuplicate(optimised, taxa, lastEntry - 1);
  }
  return true;
}

function withoutTaxon(taxa: FlatTaxon) {
  if (!taxa[TAXON]) console.warn(`${taxa[ID]} has no taxon`);
  return !!taxa[TAXON];
}

/** Optimises the array by grouping species by genus. */
export default function optimise(speciesFromReport: RemoteAttributes[]) {
  const speciesFlattened =
    flattenSpeciesReport(speciesFromReport).filter(withoutTaxon);

  checkAllSpeciesHasInformalGroup(speciesFlattened);

  const optimised: OptimisedSpecies = [];
  speciesFlattened.forEach(taxa => {
    const splitTaxonName = taxa[TAXON].split(' ');

    // Hybrid genus names starting with X need a full genus name.
    if (splitTaxonName[0].toLowerCase() === 'x') {
      splitTaxonName[0] = `${splitTaxonName.shift()} ${splitTaxonName[0]}`;
    }
    if (splitTaxonName.length === 1) {
      if (isGenusDuplicate(optimised, taxa)) {
        console.warn(`Duplicate genus found: ${taxa.toString()}`);
        return;
      }
      addGenus(optimised, taxa);
      return;
    }

    addSpecies(optimised, taxa, splitTaxonName);
  });

  return optimised;
}
