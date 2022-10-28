/** ****************************************************************************
 * Extract common names as pointers in an array.
 **************************************************************************** */

/* eslint-disable */

const {
  GENUS_SPECIES_INDEX,
  GENUS_NAMES_INDEX,
  SPECIES_NAMES_INDEX,
} = require('./constants');

const {
  getCommonName,
} = require('../../Survey/common/Components/TaxonSearch/utils/searchHelpers.js');

/**
 * Splits a word and adds it to common names array
 * @param word
 * @param index
 */
function addWord(namePointers, word, ...index) {
  const words = word.split(' ');
  words.forEach((_, wordIndex) => {
    namePointers[wordIndex] = namePointers[wordIndex] || [];
    namePointers[wordIndex].push(index);
  });
}

function addGenusNamePointers(namePointers, names, genusIndex) {
  names.forEach((name, nameIndex) =>
    addWord(namePointers, name, genusIndex, nameIndex)
  );
}

function addSpeciesNamePointers(namePointers, speciesArray, genusIndex) {
  speciesArray.forEach((species, speciesIndex) => {
    if (species[SPECIES_NAMES_INDEX]) {
      species[SPECIES_NAMES_INDEX].forEach((name, nameIndex) =>
        addWord(namePointers, name, genusIndex, speciesIndex, nameIndex)
      );
    }
  });
}

function getNamePointers(genusArray) {
  const namePointers = [];

  genusArray.forEach((speciesEntry, genusIndex) => {
    const genusNamesArray = speciesEntry[GENUS_NAMES_INDEX] || [];
    addGenusNamePointers(namePointers, genusNamesArray, genusIndex);

    const speciesArray = speciesEntry[GENUS_SPECIES_INDEX] || [];
    addSpeciesNamePointers(namePointers, speciesArray, genusIndex);
  });

  return namePointers;
}

const sortPointers = (species, namePointers) => {
  // sort within each name-word-count index
  const pointerSorter = (names, nameIndex) => {
    names.sort((a, b) => {
      let spA = getCommonName(species, a);
      let spB = getCommonName(species, b);

      // sort by name count
      const spAwords = spA.split(' ');
      spA = spAwords.slice(nameIndex, spAwords.length).join(' ');
      const spBwords = spB.split(' ');
      spB = spBwords.slice(nameIndex, spBwords.length).join(' ');

      if (spA > spB) {
        return 1;
      } else if (spA < spB) {
        return -1;
      }
      return 0;
    });
  };

  namePointers.forEach(pointerSorter);
};

module.exports = species => {
  console.log('Building name map...');

  const namePointers = getNamePointers(species);
  sortPointers(species, namePointers);

  return namePointers;
};
