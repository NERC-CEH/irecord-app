/** ****************************************************************************
 * Common name search.
 *****************************************************************************/
import helpers from './searchHelpers';

const WAREHOUSE_INDEX = 0;
const GROUP_INDEX = 1;
const SCI_NAME_INDEX = 2; // in genera and above
const GENUS_COMMON_INDEX = 3;
const GENUS_COMMON_SYN_INDEX = 4;
const SPECIES_SCI_NAME_INDEX = 1; // in species and bellow
const SPECIES_COMMON_INDEX = 2; // in species and bellow
const SPECIES_COMMON_SYN_INDEX = 3; // in species and bellow
const MAX = 20;

/**
 * Search for Common names
 * @param species
 * @param commonNamePointers
 * @param searchPhrase
 * @returns {Array}
 */
export default function (species, commonNamePointersArray,
                         searchPhrase, results = [], maxResults = MAX) {
  const searchWords = searchPhrase.split(' ');
  const matches = [];

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

  // for each word index
  for (let wordCount = 0;
       wordCount < commonNamePointersArray.length && matches.length < maxResults;
       wordCount++) {
    const commonNamePointers = commonNamePointersArray[wordCount];
    const pointerArrayLength = commonNamePointers.length;

    // find first match in array
    let pointersArrayIndex = helpers.findFirstMatching(
      species,
      commonNamePointers,
      searchPhrase, wordCount
    );

    // go through all common name pointers
    while (pointersArrayIndex !== null && pointersArrayIndex >= 0 &&
    pointersArrayIndex < pointerArrayLength &&
    matches.length < maxResults) {
      const p = commonNamePointers[pointersArrayIndex];
      if (helpers.isGenusPointer(p)) {
        const genus = species[p[0]];
        let name = genus[p[1]];
        name = name.split(/\s+/).slice(wordCount).join(' ');
        // stop looking further if first name does not match
        if (!firstWordRegex.test(name)) break;

        if (!otherWordsRegex || otherWordsRegex.test(name)) {
          const foundInName = p[1] === GENUS_COMMON_SYN_INDEX ? 'synonym' : 'common_name';

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
          matches.push(fullRes);
        }
      } else {
        const genus = species[p[0]];
        const speciesEntry = genus[p[1]][p[2]];
        // carry on while it matches the first name
        const foundInName = p[3] === SPECIES_COMMON_SYN_INDEX ? 'synonym' : 'common_name';
        let name = speciesEntry[p[3]];
        name = name.split(/\s+/).slice(wordCount).join(' ');

        // stop looking further if first name does not match
        if (!firstWordRegex.test(name)) break;

        if (!otherWordsRegex || otherWordsRegex.test(name)) {
          const fullRes = {
            array_id: p[0],
            species_id: p[1],
            found_in_name: foundInName,
            warehouse_id: speciesEntry[WAREHOUSE_INDEX],
            group: genus[GROUP_INDEX],
            scientific_name: `${genus[SCI_NAME_INDEX]} ${speciesEntry[SPECIES_SCI_NAME_INDEX]}`,
            common_name: speciesEntry[SPECIES_COMMON_INDEX],
            synonym: speciesEntry[SPECIES_COMMON_SYN_INDEX],
          };
          matches.push(fullRes);
        }
      }
      pointersArrayIndex++;
    }
  }

  // sort matches by common name and then by latin name word count
  // @todo if this was applied to iRecord then might also need to take account of kingdom
  matches.sort((a, b) => {
    if (a.common_name === b.common_name) {
      return a.scientific_name.split(/\s+/).length - b.scientific_name.split(/\s+/).length;
    }

    return a.common_name.localeCompare(b.common_name);
  });

  // deduplicate matches
  let previous = null;
  matches.forEach((taxon) => {
    if (!previous || (previous.common_name !== taxon.common_name)) {
      results.push(taxon);
      previous = taxon;
    } else if (
      taxon.scientific_name.split(/\s+/).length ===
      previous.scientific_name.split(/\s+/).length
    ) {
      // need to qualify both the last pushed name and this entry with the
      // scientific name helps to disambiguate Silene pusilla and
      // Silene suecica with have been (wrongly) assigned the same
      // vernacular name
      const previousQualified = Object.assign({}, previous);
      previousQualified.common_name = `${previous.common_name} <small><i>(${previous.scientific_name})</i></small>`;
      // replace last result with qualified copy
      results[results.length - 1] = previousQualified; // eslint-disable-line

      const currentQualified = Object.assign({}, taxon);
      currentQualified.common_name = `${taxon.common_name} <small><i>(${taxon.scientific_name})</i></small>`;
      results[results.length] = currentQualified; // eslint-disable-line
    }
  });

  return results;
}
