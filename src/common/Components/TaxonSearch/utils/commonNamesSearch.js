/** ****************************************************************************
 * Common name search.
 **************************************************************************** */
import {
  GENUS_ID_INDEX,
  GENUS_GROUP_INDEX,
  GENUS_TAXON_INDEX,
  GENUS_SPECIES_INDEX,
  GENUS_NAMES_INDEX,
  SPECIES_ID_INDEX,
  SPECIES_TAXON_INDEX,
  SPECIES_NAMES_INDEX,
} from 'common/data/constants.json';
import helpers from './searchHelpers';

function addGenusToResults(results, genus, p) {
  // check if matches full phrase
  results.push({
    array_id: p[0],
    found_in_name: p[1],
    warehouse_id: genus[GENUS_ID_INDEX],
    group: genus[GENUS_GROUP_INDEX],
    scientific_name: genus[GENUS_TAXON_INDEX],
    common_names: genus[GENUS_NAMES_INDEX],
  });
}

function addSpeciesToResults(results, genus, p) {
  const [, speciesIndex] = p;
  const speciesEntry = genus[GENUS_SPECIES_INDEX][speciesIndex];

  results.push({
    array_id: p[0],
    species_id: p[1],
    found_in_name: p[2],
    warehouse_id: speciesEntry[SPECIES_ID_INDEX],
    group: genus[GENUS_GROUP_INDEX],
    scientific_name: `${genus[GENUS_TAXON_INDEX]} ${speciesEntry[SPECIES_TAXON_INDEX]}`,
    common_names: speciesEntry[SPECIES_NAMES_INDEX],
  });
}

function addToResults(results, genus, p) {
  if (helpers.isGenusPointer(p)) {
    addGenusToResults(results, genus, p);
  } else {
    addSpeciesToResults(results, genus, p);
  }
}

function getNameFromPointer(genus, p) {
  if (helpers.isGenusPointer(p)) {
    const [, nameIndex] = p;
    return genus[GENUS_NAMES_INDEX][nameIndex];
  }

  const [, speciesIndex, nameIndex] = p;
  const speciesEntry = genus[GENUS_SPECIES_INDEX][speciesIndex];
  return speciesEntry[SPECIES_NAMES_INDEX][nameIndex];
}

function firstNameMatchCheck(genus, p, firstWordRegex, wordCount) {
  const name = getNameFromPointer(genus, p);
  const word = name
    .split(/\s+/)
    .slice(wordCount)
    .join(' ');

  return firstWordRegex.test(word);
}

function otherNamesMatchCheck(genus, p, otherWordsRegex, wordCount) {
  const name = getNameFromPointer(genus, p);
  const word = name
    .split(/\s+/)
    .slice(wordCount)
    .join(' ');

  return !otherWordsRegex || otherWordsRegex.test(word);
}

function groupMatchCheck(informalGroups, group) {
  // check if species is in informal groups to search
  if (informalGroups.length && informalGroups.indexOf(group) < 0) {
    // skip this taxa because not in the searched informal groups
    return false;
  }
  return true;
}

function searchWordIndex(
  results,
  species,
  wordIndex,
  searchPhrase,
  firstWordRegex,
  otherWordsRegex,
  wordCount,
  maxResults,
  informalGroups
) {
  // find first match in array
  let pointersArrayIndex = helpers.findFirstMatching(
    species,
    wordIndex,
    searchPhrase,
    wordCount
  );

  if (!pointersArrayIndex || pointersArrayIndex < 0) {
    return;
  }

  while (pointersArrayIndex < wordIndex.length) {
    if (results.length >= maxResults) {
      return;
    }

    const p = wordIndex[pointersArrayIndex];
    const genus = species[p[0]];

    const matchesGroup = groupMatchCheck(
      informalGroups,
      genus[GENUS_GROUP_INDEX]
    );

    const matchesFirstName = firstNameMatchCheck(
      genus,
      p,
      firstWordRegex,
      wordCount
    );

    const matchesOtherNames = otherNamesMatchCheck(
      genus,
      p,
      otherWordsRegex,
      wordCount
    );

    if (matchesGroup) {
      if (!matchesFirstName) {
        break;
      }

      if (matchesOtherNames) {
        addToResults(results, genus, p);
      }
    }

    pointersArrayIndex += 1;
  }
}

/**
 * Search for Common names
 * @param species
 * @param wordIndex
 * @param searchPhrase
 * @returns {Array}
 */
function search(
  species,
  wordIndexArray,
  searchPhrase,
  maxResults,
  informalGroups
) {
  const results = [];

  const { firstWordRegex } = helpers.getFirstWordRegex(searchPhrase);
  const { otherWordsRegex } = helpers.getOtherWordsRegex(searchPhrase);

  wordIndexArray.forEach((wordIndex, wordCount) => {
    if (results.length >= maxResults) {
      return;
    }

    searchWordIndex(
      results,
      species,
      wordIndex,
      searchPhrase,
      firstWordRegex,
      otherWordsRegex,
      wordCount,
      maxResults,
      informalGroups
    );
  });

  return results;
}

export default search;
