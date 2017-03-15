/** ****************************************************************************
 * Extract common names as pointers in an array.
 *****************************************************************************/

// get the filename
const inputFileName = process.argv[2];
const outputFileName = process.argv[3];

const fs = require('fs');

const species = require(inputFileName);

const GENUS_COMMON_INDEX = 3;
const GENUS_COMMON_SYN_INDEX = 4;
const SPECIES_COMMON_INDEX = 2; // in species and bellow
const SPECIES_COMMON_SYN_INDEX = 3; // in species and bellow

const helpers = {
  /**
   * Return common name from common names array pointer
   * @param p array pointer
   */
  getCommonName(allSpecies, p) {
    let name;
    if (helpers.isGenusPointer(p)) {
      // genus common name
      name = allSpecies[p[0]][p[1]];
    } else {
      name = allSpecies[p[0]][p[1]][p[2]][p[3]];
    }
    return name.toLowerCase();
  },

  isGenusPointer(p) {
    return p.length === 2;
  },
};

function make() {
  const commonNames = []; // eg. first second third

  /**
   * Splits a word and adds it to common names array
   * @param word
   * @param index
   */
  function addWord(word, ...index) {
    const words = word.split(' ');
    for (let i = 0; i < words.length; i++) {
      commonNames[i] = commonNames[i] || [];
      commonNames[i].push(index);
    }
  }

  // go through all taxa in array
  for (let i = 0, length = species.length; i < length; i++) {
    const speciesEntry = species[i];

    // if genus or above - add genus common name
    if (typeof speciesEntry[GENUS_COMMON_INDEX] === 'string') {
      // genus has a common name
      addWord(speciesEntry[GENUS_COMMON_INDEX], i, GENUS_COMMON_INDEX);
    }
    // add genus synonym
    if (typeof speciesEntry[GENUS_COMMON_SYN_INDEX] === 'string') {
      // genus has a common name
      addWord(speciesEntry[GENUS_COMMON_SYN_INDEX], i, GENUS_COMMON_SYN_INDEX);
    }

    // find species array within genus object
    let speciesArray;
    let j = 0;
    for (let total = speciesEntry.length; j < total; j++) {
      if (speciesEntry[j] instanceof Array) {
        speciesArray = speciesEntry[j];
        break;
      }
    }

    if (speciesArray) {
      for (let k = 0, speciesLength = speciesArray.length; k < speciesLength; k++) {
        const speciesInArray = speciesArray[k];
        // add common names
        if (speciesInArray[SPECIES_COMMON_INDEX]) {
          addWord(speciesInArray[SPECIES_COMMON_INDEX], i, j, k, SPECIES_COMMON_INDEX);
        }
        // add synonyms
        if (speciesInArray[SPECIES_COMMON_SYN_INDEX]) {
          addWord(speciesInArray[SPECIES_COMMON_SYN_INDEX], i, j, k, SPECIES_COMMON_SYN_INDEX);
        }
      }
    }
  }

  for (let nameCount = 0; nameCount < commonNames.length; nameCount++) {
    commonNames[nameCount].sort((a, b) => {
      let spA = helpers.getCommonName(species, a);
      let spB = helpers.getCommonName(species, b);

      // sort by name count
      const spAwords = spA.split(' ');
      spA = spAwords.slice(nameCount, spAwords.length).join(' ');
      const spBwords = spB.split(' ');
      spB = spBwords.slice(nameCount, spBwords.length).join(' ');

      if (spA > spB) {
        return 1;
      } else if (spA < spB) {
        return -1;
      }
      return 0;
    });
  }

  return commonNames;
}

const map = make();

fs.writeFile(outputFileName, JSON.stringify(map), function (err) { // eslint-disable-line
  if (err) {
    console.log(err);
    return;
  }

  console.log('Done.');
});
