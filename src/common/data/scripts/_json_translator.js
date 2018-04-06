// # Transforms a CSV file into a JSON file
// # eg.
// # A, B, C[], C[], C[], D[], E{A}, E{B}, F{P{L[]}}
// #
// # {A, B, [C, C, C], [D], E:{A, B}}, F:{P:[L]}
'use strict'; // eslint-disable-line

const taxonCleaner = require('./_clean');
const csv = require('csv');  // eslint-disable-line

const SYNONYM = 4;
const COMMON_NAME = 3;
const TAXON = 2;
const GROUP = 1;
const ID = 0;

function normalizeValue(value) {
  // check if int
  // https://coderwall.com/p/5tlhmw/converting-strings-to-number-in-javascript-pitfalls
  const int = value * 1;
  if (!Number.isNaN(int)) {
    return int;
  }
  return value;
}

function processRow(header, row) {
  const rowObj = [];

  // for each row column value set it in the right rowObj
  row.forEach(columnVal => {
    if (columnVal) {
      rowObj.push(normalizeValue(columnVal));
    }
  });

  return rowObj;
}

/**
 * Process the CSV file.
 * @param output
 * @returns {Array}
 */
function run(output) {
  const obj = [];
  const header = output.shift();
  output.forEach(row => {
    const rowObj = processRow(header, row);
    obj.push(rowObj);
  });

  return obj;
}

/**
 * Optimises the array by grouping species to genus.
 * @param output
 */
function optimise(output) {
  const optimised = [];

  function addGenus(taxa) {
    const taxon = taxonCleaner(taxa[TAXON], false, true);
    if (!taxon) {
      return;
    }

    const genus = [
      taxa[ID], // id
      taxa[GROUP], // group
      taxon, // taxon
    ];

    const name = taxonCleaner(taxa[COMMON_NAME], true, true);
    if (name) {
      genus.push(name);
    }

    const synonym = taxonCleaner(taxa[SYNONYM], true, true);
    if (synonym) {
      genus.push(synonym);
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
  function getLastGenus(taxa, taxaNameSplitted, index) {
    const lastEntry = index || optimised.length - 1;
    let lastGenus = optimised[lastEntry];
    // console.log(`---------`)
    // console.log(lastGenus)
    // console.log(taxaNameSplitted)
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
      return getLastGenus(taxa, taxaNameSplitted, lastEntry - 1);
    }

    return lastGenus;
  }

  function addSpecies(taxa, taxaNameSplitted) {
    // species that needs to be appended to genus
    const lastGenus = getLastGenus(taxa, taxaNameSplitted);

    // check genus species array - must be last
    let speciesArray = lastGenus[lastGenus.length - 1];
    if (typeof speciesArray !== 'object') {
      // new one if doesn't exist
      speciesArray = [];
      lastGenus.push(speciesArray);
    }

    const species = [];
    // id
    species.push(normalizeValue(taxa[ID]));

    // taxon
    const taxon = taxaNameSplitted.slice(1).join(' ');
    const taxonClean = taxonCleaner(taxon, false);
    if (!taxonClean) {
      // cleaner might stripped all
      return;
    }
    species.push(taxonClean); // remove genus name

    // common name
    const commonName = taxonCleaner(taxa[COMMON_NAME], true);
    if (commonName) {
      species.push(commonName);
    }

    // synonym name
    const synonym = taxonCleaner(taxa[SYNONYM], true);
    if (synonym) {
      species.push(synonym);
    }

    speciesArray.push(species);
  }

  function isGenusDuplicate(taxa, index) {
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
      return isGenusDuplicate(taxa, lastEntry - 1);
    }
    return true;
  }

  output.forEach(taxa => {
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
      if (isGenusDuplicate(taxa)) {
        console.warn(`Duplicate genus found: ${taxa.toString()}`);
        return;
      }
      addGenus(taxa);
    } else {
      addSpecies(taxa, taxaNameSplitted);
    }
  });

  return optimised;
}

/**
 * Parse raw CSV file.
 */
module.exports = (data, callback) => {
  csv.parse(data, (err, csvOutput) => {
    const jsonOutput = run(csvOutput);
    callback(err, optimise(jsonOutput));
  });
};
