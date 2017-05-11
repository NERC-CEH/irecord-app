// # Transforms a CSV file into a JSON file
// # eg.
// # A, B, C[], C[], C[], D[], E{A}, E{B}, F{P{L[]}}
// #
// # {A, B, [C, C, C], [D], E:{A, B}}, F:{P:[L]}

'use strict';
const taxonCleaner = require('./_clean');
const parse = require('csv-parse/lib/sync');

function processRow(header, row) {
  const rowObj = [];

  // for each row column value set it in the right rowObj
  row.forEach((columnVal) => {
    if (columnVal) {
      rowObj.push(normalizeValue(columnVal));
    }
  });

  return rowObj;
}


function normalizeValue(value) {
  // check if int
  //https://coderwall.com/p/5tlhmw/converting-strings-to-number-in-javascript-pitfalls
  const int = value * 1;
  if (!isNaN(int)) return int;
  return value;
}

/**
 * Process the CSV file.
 * @param output
 * @returns {Array}
 */
function run(output) {
  const obj = [];
  const header = output.shift();
  output.forEach((row) => {
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
    const taxon = taxonCleaner(taxa[2], false, true);
    if (!taxon) {
      return;
    }

    const genus = [
      taxa[0], // id
      taxa[1], // group
      taxon, // taxon
    ];
    const synonym = taxonCleaner(taxa[3], true, true);
    if (synonym) {
      genus.push(synonym);
    }

    optimised.push(genus);
  }


  function getLastGenus(taxa, taxaNameSplitted) {
    let lastGenus = optimised[optimised.length - 1];

    // check if taxa groups match
    if (lastGenus[1] !== taxa[1]) {
      // create a new genus with matching group
      lastGenus = [
        'asdas',
        taxa[1],
        taxaNameSplitted[0],
        [],
      ];
      optimised.push(lastGenus);
    }

    return lastGenus;
  }


  function addSpecies(taxa, taxaNameSplitted) {
    // species that needs to be appended to genus
    const lastGenus = getLastGenus();

    // check genus species array - must be last
    let speciesArray = lastGenus[lastGenus.length - 1];
    if (typeof speciesArray !== 'object') {
      // new one if doesn't exist
      speciesArray = [];
      lastGenus.push(speciesArray);
    }

    const species = [];
    // id
    species.push(normalizeValue(taxa[0]));

    // taxon
    const taxon = taxaNameSplitted.slice(1).join(' ');
    species.push(taxonCleaner(taxon, false)); // remove genus name

    // common name
    const commonName = taxonCleaner(taxa[3], true);
    if (commonName) {
      species.push(commonName);
    }

    // synonym name
    const synonym = taxonCleaner(taxa[4], true);
    if (synonym) {
      species.push(synonym);
    }

    speciesArray.push(species);
  }

  output.forEach((taxa) => {
    const taxaName = taxa[2];
    const taxaNameSplitted = taxaName.split(' ');

    if (taxaNameSplitted.length === 1) {
      // genus - all good
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
module.exports = (data) => {
  const csvOutput = parse(data);
  const jsonOutput = run(csvOutput);
  return optimise(jsonOutput);
};

