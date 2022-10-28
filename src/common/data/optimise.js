/* eslint-disable @typescript-eslint/no-var-requires */

const speciesInformalGroups = require('./informal_groups.data.json');
const taxonCleaner = require('./clean');

const {
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
} = require('./constants.json');

const enableWelsh = process.env.APP_WELSH;

function normalizeValue(value) {
  // check if int
  // https://coderwall.com/p/5tlhmw/converting-strings-to-number-in-javascript-pitfalls
  const int = value * 1;
  if (!Number.isNaN(int)) {
    return int;
  }
  return value;
}

function checkAllSpeciesHasInformalGroup(speciesList) {
  console.log('Checking if all the species has an informal group metadata.');

  const groups = Object.keys(speciesInformalGroups);
  speciesList.forEach(species => {
    if (!groups.includes(`${species[GROUP]}`)) {
      throw new Error(`No Such species informal group found ${species[GROUP]}`);
    }
  });
}

const flattenSpeciesReport = speciesFromReport =>
  speciesFromReport.data.map(s => {
    const flattened = [];
    flattened[ID] = parseInt(s.id, 10);
    flattened[GROUP] = parseInt(s.taxon_group, 10);
    flattened[TAXON] = s.taxon;

    flattened[COMMON_NAMES] = [];
    // in the order of importance
    if (s.common_name) {
      flattened[COMMON_NAMES].push(s.common_name);
    }
    if (s.synonym) {
      flattened[COMMON_NAMES].push(s.synonym);
    }
    if (enableWelsh && s.cym) {
      flattened[COMMON_NAMES].push(s.cym);
    }

    return flattened;
  });

function addGenus(optimised, taxa) {
  const taxon = taxonCleaner(taxa[TAXON], false, true);
  if (!taxon) {
    return;
  }

  const commonNames = taxa[COMMON_NAMES].map(name =>
    taxonCleaner(name, true, true)
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
function getLastGenus(optimised, taxa, taxaNameSplitted, index) {
  const lastEntry = index || optimised.length - 1;
  let lastGenus = optimised[lastEntry];
  // no genus with the same name and group was found
  if (lastGenus[TAXON] !== taxaNameSplitted[0]) {
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

function addSpecies(optimised, taxa, taxaNameSplitted) {
  // species that needs to be appended to genus
  const lastGenus = getLastGenus(optimised, taxa, taxaNameSplitted);

  let speciesArray = lastGenus[GENUS_SPECIES_INDEX];
  if (!speciesArray) {
    lastGenus[GENUS_SPECIES_INDEX] = [];
    speciesArray = lastGenus[GENUS_SPECIES_INDEX];
  }

  const id = normalizeValue(taxa[ID]);

  const taxon = taxaNameSplitted.slice(1).join(' ');
  const taxonClean = taxonCleaner(taxon, false);
  if (!taxonClean) {
    // cleaner might stripped all
    return;
  }

  const commonNames = taxa[COMMON_NAMES].map(name =>
    taxonCleaner(name, true)
  ).filter(exists => exists);

  const species = [];
  species[SPECIES_ID_INDEX] = id;
  species[SPECIES_TAXON_INDEX] = taxonClean;

  if (commonNames.length) {
    species[SPECIES_NAMES_INDEX] = commonNames;
  }
  speciesArray.push(species);
}

function isGenusDuplicate(optimised, taxa, index) {
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

/**
 * Optimises the array by grouping species to genus.
 */
function optimise(speciesFromReport) {
  const speciesFlattened = flattenSpeciesReport(speciesFromReport);

  checkAllSpeciesHasInformalGroup(speciesFlattened);

  const optimised = [];

  speciesFlattened.forEach(taxa => {
    const taxaName = taxa[TAXON];
    const taxaNameSplitted = taxaName.split(' ');

    // hybrid genus names starting with X should
    // have a full genus eg. X Agropogon littoralis
    if (taxaNameSplitted[0] === 'X') {
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

module.exports = optimise;
