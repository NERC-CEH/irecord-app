/** ****************************************************************************
 * Common name search.
 **************************************************************************** */
import helpers from './searchHelpers';

const WAREHOUSE_INDEX = 0;
const GROUP_INDEX = 1;
const SCI_NAME_INDEX = 2; // in genera and above
const GENUS_COMMON_INDEX = 3;
const GENUS_COMMON_SYN_INDEX = 4;
const SPECIES_SCI_NAME_INDEX = 1; // in species and bellow
const SPECIES_COMMON_INDEX = 2; // in species and bellow
const SPECIES_COMMON_SYN_INDEX = 3; // in species and bellow

/**
 * Search for Common names
 * @param species
 * @param commonNamePointers
 * @param searchPhrase
 * @returns {Array}
 */
export default function(
  species,
  commonNamePointersArray,
  searchPhrase,
  maxResults,
  informalGroups
) {
  const searchWords = searchPhrase.split(' ');
  const results = [];

  // prepare first word regex
  const firstWord = helpers.normalizeFirstWord(searchWords[0]);
  const firstWordRegexStr = helpers.getFirstWordRegexString(firstWord);
  const firstWordRegex = new RegExp(firstWordRegexStr, 'i');

  // prepare other words regex
  const otherWords = searchWords.splice(1).join(' ');
  let otherWordsRegexStr;
  let otherWordsRegex;
  if (otherWords) {
    otherWordsRegexStr = helpers.getOtherWordsRegexString(otherWords);
    otherWordsRegex = new RegExp(otherWordsRegexStr, 'i');
  }

  // eslint-disable-next-line
  function informalGroupMatch(informalGroups, group) {
    // check if species is in informal groups to search
    if (informalGroups.length && informalGroups.indexOf(group) < 0) {
      // skip this taxa because not in the searched informal groups
      return false;
    }
    return true;
  }

  // for each word index
  for (
    let wordCount = 0;
    wordCount < commonNamePointersArray.length && results.length < maxResults;
    wordCount++
  ) {
    const commonNamePointers = commonNamePointersArray[wordCount];
    const pointerArrayLength = commonNamePointers.length;

    // find first match in array
    let pointersArrayIndex = helpers.findFirstMatching(
      species,
      commonNamePointers,
      searchPhrase,
      wordCount
    );

    // go through all common name pointers
    while (
      pointersArrayIndex !== null &&
      pointersArrayIndex >= 0 &&
      pointersArrayIndex < pointerArrayLength &&
      results.length < maxResults
    ) {
      const p = commonNamePointers[pointersArrayIndex];
      if (helpers.isGenusPointer(p)) {
        const genus = species[p[0]];

        if (!informalGroupMatch(informalGroups, genus[GROUP_INDEX])) {
          pointersArrayIndex++;
          continue; // eslint-disable-line
        }

        let name = genus[p[1]];
        name = name
          .split(/\s+/)
          .slice(wordCount)
          .join(' ');
        // stop looking further if first name does not match
        if (!firstWordRegex.test(name)) {
          break;
        }

        if (!otherWordsRegex || otherWordsRegex.test(name)) {
          const foundInName =
            p[1] === GENUS_COMMON_SYN_INDEX ? 'synonym' : 'common_name';

          // check if matches full phrase
          const fullRes = {
            array_id: p[0],
            found_in_name: foundInName,
            warehouse_id: genus[WAREHOUSE_INDEX],
            group: genus[GROUP_INDEX],
            scientific_name: genus[SCI_NAME_INDEX],
            common_name: genus[GENUS_COMMON_INDEX],
            synonym: genus[GENUS_COMMON_SYN_INDEX],
          };
          results.push(fullRes);
        }
      } else {
        const genus = species[p[0]];
        const speciesEntry = genus[p[1]][p[2]];

        if (!informalGroupMatch(informalGroups, genus[GROUP_INDEX])) {
          pointersArrayIndex++;
          continue; // eslint-disable-line
        }

        // carry on while it matches the first name
        const foundInName =
          p[3] === SPECIES_COMMON_SYN_INDEX ? 'synonym' : 'common_name';
        let name = speciesEntry[p[3]];
        name = name
          .split(/\s+/)
          .slice(wordCount)
          .join(' ');

        // stop looking further if first name does not match
        if (!firstWordRegex.test(name)) {
          break;
        }

        if (!otherWordsRegex || otherWordsRegex.test(name)) {
          const fullRes = {
            array_id: p[0],
            species_id: p[1],
            found_in_name: foundInName,
            warehouse_id: speciesEntry[WAREHOUSE_INDEX],
            group: genus[GROUP_INDEX],
            scientific_name: `${genus[SCI_NAME_INDEX]} ${
              speciesEntry[SPECIES_SCI_NAME_INDEX]
            }`,
            common_name: speciesEntry[SPECIES_COMMON_INDEX],
            synonym: speciesEntry[SPECIES_COMMON_SYN_INDEX],
          };
          results.push(fullRes);
        }
      }
      pointersArrayIndex++;
    }
  }

  return results;
}
