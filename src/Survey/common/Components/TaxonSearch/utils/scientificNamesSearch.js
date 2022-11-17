/** ****************************************************************************
 * Scientific name search.
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

function addGenusToResults(results, genus, generaIndex) {
  if (genus[GENUS_ID_INDEX]) {
    // why genus[GENUS_ID_INDEX] see 'sandDustHack' in generator
    results.push({
      array_id: generaIndex,
      warehouse_id: genus[GENUS_ID_INDEX],
      group: genus[GENUS_GROUP_INDEX],
      scientific_name: genus[GENUS_TAXON_INDEX],
      common_names: genus[GENUS_NAMES_INDEX] || [],
    });
  }

  const speciesArray = genus[GENUS_SPECIES_INDEX] || [];

  // eslint-disable-next-line
  speciesArray.forEach((species, speciesIndex) => {
    results.push({
      array_id: generaIndex,
      species_id: speciesIndex,
      warehouse_id: species[SPECIES_ID_INDEX],
      group: genus[GENUS_GROUP_INDEX],
      scientific_name: `${genus[GENUS_TAXON_INDEX]} ${species[SPECIES_TAXON_INDEX]}`,
      common_names: species[SPECIES_NAMES_INDEX] || [],
    });
  });
}

function addSpeciesToResults(results, genus, generaIndex, otherWordsRegex) {
  const speciesArray = genus[GENUS_SPECIES_INDEX] || [];

  // eslint-disable-next-line
  speciesArray.forEach((species, speciesIndex) => {
    if (otherWordsRegex.test(species[SPECIES_TAXON_INDEX])) {
      results.push({
        array_id: generaIndex,
        species_id: speciesIndex,
        warehouse_id: species[SPECIES_ID_INDEX],
        group: genus[GENUS_GROUP_INDEX],
        scientific_name: `${genus[GENUS_TAXON_INDEX]} ${species[SPECIES_TAXON_INDEX]}`,
        common_names: species[SPECIES_NAMES_INDEX] || [],
      });
    }
  });
}

function searchGeneraDictionary(
  results,
  genera,
  maxResults,
  informalGroupsMatch,
  firstWord,
  firstWordRegex,
  otherWordsRegex
) {
  let generaIndex = helpers.findFirstMatching(genera, genera, firstWord);
  if (generaIndex === null || generaIndex < 0) {
    return;
  }

  while (generaIndex < genera.length) {
    if (results.length >= maxResults) {
      return;
    }

    const genus = genera[generaIndex];
    const endOfMatchingGenus = !firstWordRegex.test(genus[GENUS_TAXON_INDEX]);
    if (endOfMatchingGenus) {
      return;
    }

    if (informalGroupsMatch(genus)) {
      if (!otherWordsRegex) {
        addGenusToResults(results, genus, generaIndex);
      } else {
        addSpeciesToResults(results, genus, generaIndex, otherWordsRegex);
      }
    }

    generaIndex += 1;
  }
}

/**
 * Search Scientific names
 * @param species
 * @param searchPhrase
 * @returns {Array}
 */
function search(
  genera,
  searchPhrase,
  results = [],
  maxResults,
  hybridRun,
  informalGroups = []
) {
  let { firstWord, firstWordRegexStr, firstWordRegex } =
    helpers.getFirstWordRegex(searchPhrase);

  let { otherWordsRegex } = helpers.getOtherWordsRegex(searchPhrase);

  // check if hybrid eg. X Cupressocyparis
  if (!hybridRun && searchPhrase.match(/X\s.*/i)) {
    search(genera, searchPhrase, results, maxResults, true, informalGroups);
  } else if (hybridRun) {
    // run with different first word
    firstWord = helpers.normalizeFirstWord(searchPhrase);
    firstWordRegexStr = helpers.getFirstWordRegexString(firstWord);
    firstWordRegex = new RegExp(firstWordRegexStr, 'i');
    otherWordsRegex = null;
  }

  const informalGroupsMatch = genus =>
    !informalGroups.length ||
    informalGroups.indexOf(genus[GENUS_GROUP_INDEX]) >= 0;

  searchGeneraDictionary(
    results,
    genera,
    maxResults,
    informalGroupsMatch,
    firstWord,
    firstWordRegex,
    otherWordsRegex
  );

  if (results.length < maxResults) {
    // search any part of the name
    // otherWordsRegex = new RegExp(`.*${searchPhrase}`, 'i');
    const searchedPhraseEscaped = helpers.escapeRegExp(searchPhrase);
    otherWordsRegex = new RegExp(searchedPhraseEscaped, 'i');

    firstWord = '';
    firstWordRegex = /^.*/i;

    searchGeneraDictionary(
      results,
      genera,
      maxResults,
      informalGroupsMatch,
      firstWord,
      firstWordRegex,
      otherWordsRegex
    );
  }

  return results;
}

export default function searchSciNames(
  genera,
  searchPhrase,
  maxResults,
  hybridRun,
  informalGroups = []
) {
  const results = search(
    genera,
    searchPhrase,
    [],
    maxResults,
    hybridRun,
    informalGroups
  );

  const is5CharacterShortcut = searchPhrase.length === 5;
  const exceededMaxResults = results.length >= maxResults;
  if (is5CharacterShortcut && !exceededMaxResults) {
    const genus = searchPhrase.substr(0, 2);
    const name = searchPhrase.substr(2, 4);
    const searchPhraseShortcut = `${genus} ${name}`;

    search(
      genera,
      searchPhraseShortcut,
      results,
      maxResults,
      hybridRun,
      informalGroups
    );
  }

  const uniqueIds = [];
  const deDupedResults = results.filter(sp => {
    if (!uniqueIds.includes(sp.warehouse_id)) {
      uniqueIds.push(sp.warehouse_id);
      return true;
    }
    return false;
  });

  return deDupedResults;
}
