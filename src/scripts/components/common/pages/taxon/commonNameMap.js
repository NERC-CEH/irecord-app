/** ****************************************************************************
 * Extract common names as pointers in an array.
 *****************************************************************************/
import helpers from './searchHelpers';

const GENUS_COMMON_INDEX = 3;
const SPECIES_COMMON_INDEX = 2; // in species and bellow
const SPECIES_COMMON_SYN_INDEX = 3; // in species and bellow

export default function () {
  const species = window.species_list;
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

  for (let i = 1, length = species.length; i < length; i++) {
    const speciesEntry = species[i];

    // if genus
    if (typeof speciesEntry[GENUS_COMMON_INDEX] === 'string') {
      // genus has a common name
      addWord(speciesEntry[GENUS_COMMON_INDEX], i, GENUS_COMMON_INDEX);
      continue;
    }

    // find species array
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
        if (speciesInArray[SPECIES_COMMON_INDEX]) {
          addWord(speciesInArray[SPECIES_COMMON_INDEX], i, j, k, SPECIES_COMMON_INDEX);
        }
        if (speciesInArray[SPECIES_COMMON_SYN_INDEX]) {
          addWord(speciesInArray[SPECIES_COMMON_INDEX], i, j, k, SPECIES_COMMON_SYN_INDEX);
        }
      }
    }
  }

  for (let nameCount = 0; nameCount < commonNames.length; nameCount++) {
    commonNames[nameCount].sort((a, b) => {
      let spA = helpers.getCommonName(species, a);
      let spB = helpers.getCommonName(species, b);

      // sort by name count
      spA = spA.split(' ')[nameCount];
      spB = spB.split(' ')[nameCount];

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
