/** ****************************************************************************
 * Scientific name search.
 **************************************************************************** */
import helpers from './searchHelpers';

const WAREHOUSE_INDEX = 0;
const GROUP_INDEX = 1;
const SCI_NAME_INDEX = 2; // in genera and above
const SPECIES_SCI_NAME_INDEX = 1; // in species and bellow
const SPECIES_COMMON_INDEX = 2; // in species and bellow
const SPECIES_COMMON_SYN_INDEX = 3; // in species and bellow

/**
 * Search Scientific names
 * @param species
 * @param searchPhrase
 * @returns {Array}
 */
function searchSciNames(
  species,
  searchPhrase,
  results = [],
  maxResults,
  hybridRun,
  informalGroups = []
) {
  const searchWords = searchPhrase.split(' ');

  // prepare first word regex
  let firstWord = helpers.normalizeFirstWord(searchWords[0]);
  let firstWordRegexStr = helpers.getFirstWordRegexString(firstWord);
  let firstWordRegex = new RegExp(firstWordRegexStr, 'i');

  // prepare other words regex
  let otherWords = searchWords.splice(1).join(' ');
  let otherWordsRegex;
  if (otherWords) {
    otherWordsRegex = new RegExp(
      `^${helpers.getOtherWordsRegexString(otherWords)}`,
      'i'
    );
  }

  // check if hybrid eg. X Cupressocyparis
  if (!hybridRun && searchPhrase.match(/X\s.*/i)) {
    searchSciNames(
      species,
      searchPhrase,
      results,
      maxResults,
      true,
      informalGroups
    );
  } else if (hybridRun) {
    // run with different first word
    firstWord = helpers.normalizeFirstWord(searchPhrase);
    firstWordRegexStr = helpers.getFirstWordRegexString(firstWord);
    firstWordRegex = new RegExp(firstWordRegexStr, 'i');
    otherWords = null;
    otherWordsRegex = null;
  }

  // find first match in array
  let speciesArrayIndex = helpers.findFirstMatching(
    species,
    species,
    firstWord
  );

  // go through all
  const speciesArrayLength = species.length;
  while (
    speciesArrayIndex !== null &&
    speciesArrayIndex >= 0 &&
    speciesArrayIndex < speciesArrayLength &&
    results.length < maxResults
  ) {
    const speciesEntry = species[speciesArrayIndex];

    // check if species is in informal groups to search
    if (
      informalGroups.length &&
      informalGroups.indexOf(speciesEntry[GROUP_INDEX]) < 0
    ) {
      // skip this taxa because not in the searched informal groups
      speciesArrayIndex++;
      continue; // eslint-disable-line
    }

    // check if matches
    if (firstWordRegex.test(speciesEntry[SCI_NAME_INDEX])) {
      // find species array
      let speciesArray;
      for (let j = 0, length = speciesEntry.length; j < length; j++) {
        if (speciesEntry[j] instanceof Array) {
          speciesArray = speciesEntry[j];
        }
      }

      let fullRes;
      if (!otherWordsRegex && speciesEntry[WAREHOUSE_INDEX]) {
        // no need to add genus if searching for species
        // why speciesEntry[WAREHOUSE_INDEX] see 'sandDustHack' in generator
        fullRes = {
          array_id: speciesArrayIndex,
          found_in_name: 'scientific_name',
          warehouse_id: speciesEntry[WAREHOUSE_INDEX],
          group: speciesEntry[GROUP_INDEX],
          scientific_name: speciesEntry[SCI_NAME_INDEX]
        };
        results.push(fullRes);
      }

      // if this is genus
      if (speciesArray) {
        // go through all species
        for (
          let speciesIndex = 0, length = speciesArray.length;
          speciesIndex < length && results.length < maxResults;
          speciesIndex++
        ) {
          const speciesInArray = speciesArray[speciesIndex];
          if (otherWordsRegex) {
            // if search through species
            // check if matches
            if (otherWordsRegex.test(speciesInArray[SPECIES_SCI_NAME_INDEX])) {
              // add full sci name
              fullRes = {
                array_id: speciesArrayIndex,
                species_id: speciesIndex,
                found_in_name: 'scientific_name',
                warehouse_id: speciesInArray[WAREHOUSE_INDEX],
                group: speciesEntry[GROUP_INDEX],
                scientific_name: `${speciesEntry[SCI_NAME_INDEX]} ${
                  speciesInArray[SPECIES_SCI_NAME_INDEX]
                }`,
                common_name: speciesInArray[SPECIES_COMMON_INDEX],
                synonym: speciesInArray[SPECIES_COMMON_SYN_INDEX]
              };
              results.push(fullRes);
            }
          } else {
            // if only genus search add its species
            fullRes = {
              array_id: speciesArrayIndex,
              species_id: speciesIndex,
              found_in_name: 'scientific_name',
              warehouse_id: speciesInArray[WAREHOUSE_INDEX],
              group: speciesEntry[GROUP_INDEX],
              scientific_name: `${speciesEntry[SCI_NAME_INDEX]} ${
                speciesInArray[SPECIES_SCI_NAME_INDEX]
              }`,
              common_name: speciesInArray[SPECIES_COMMON_INDEX],
              synonym: speciesInArray[SPECIES_COMMON_SYN_INDEX]
            };
            results.push(fullRes);
          }
        }
      }
    } else {
      // stop looking further if not found
      break;
    }
    speciesArrayIndex++;
  }
  return results;
}

export { searchSciNames as default };
