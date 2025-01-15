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
} from 'common/data/constants';
import {
  Genera,
  NamePointers,
  NamePointer,
  Genus,
  Taxon,
  GenusNamePointer,
  CommonNamePointer,
} from '.';
import {
  findFirstMatching,
  getFirstWordRegex,
  getOtherWordsRegex,
  isGenusPointer,
} from './searchHelpers';

function addGenusToResults(
  results: Taxon[],
  genus: Genus,
  p: GenusNamePointer
) {
  // check if matches full phrase
  results.push({
    arrayId: p[0],
    foundInName: p[1],
    warehouseId: genus[GENUS_ID_INDEX],
    group: genus[GENUS_GROUP_INDEX],
    scientificName: genus[GENUS_TAXON_INDEX],
    commonNames: genus[GENUS_NAMES_INDEX] || [],
  });
}

function addSpeciesToResults(
  results: Taxon[],
  genus: Genus,
  p: CommonNamePointer
) {
  const speciesIndex = p[1];
  const speciesEntry = genus[GENUS_SPECIES_INDEX]![speciesIndex];

  results.push({
    arrayId: p[0],
    speciesId: p[1],
    foundInName: p[2],
    warehouseId: speciesEntry[SPECIES_ID_INDEX],
    group: genus[GENUS_GROUP_INDEX],
    scientificName: `${genus[GENUS_TAXON_INDEX]} ${speciesEntry[SPECIES_TAXON_INDEX]}`,
    commonNames: speciesEntry[SPECIES_NAMES_INDEX] || [],
  });
}

function addToResults(results: Taxon[], genus: Genus, p: NamePointer) {
  if (isGenusPointer(p)) {
    addGenusToResults(results, genus, p);
  } else {
    addSpeciesToResults(results, genus, p as CommonNamePointer);
  }
}

function getNameFromPointer(genus: Genus, p: NamePointer) {
  if (isGenusPointer(p)) {
    const genusPointer = p as GenusNamePointer;
    const nameIndex = genusPointer[1];
    return genus[GENUS_NAMES_INDEX]![nameIndex];
  }

  const commonNamePointer = p as CommonNamePointer;
  const speciesIndex = commonNamePointer[1];
  const nameIndex = commonNamePointer[2];
  const speciesEntry = genus[GENUS_SPECIES_INDEX]![speciesIndex];
  return speciesEntry[SPECIES_NAMES_INDEX]![nameIndex];
}

function firstNameMatchCheck(
  genus: Genus,
  p: NamePointer,
  firstWordRegex: RegExp,
  wordCount: number
) {
  const name = getNameFromPointer(genus, p);
  const word = name.split(/\s+/).slice(wordCount).join(' ');

  return firstWordRegex.test(word);
}

function otherNamesMatchCheck(
  genus: Genus,
  p: NamePointer,
  otherWordsRegex: RegExp | undefined,
  wordCount: number
) {
  const name = getNameFromPointer(genus, p);
  const word = name.split(/\s+/).slice(wordCount).join(' ');

  return !otherWordsRegex || otherWordsRegex.test(word);
}

function groupMatchCheck(informalGroups: number[], group: number) {
  // check if species is in informal groups to search
  if (informalGroups.length && informalGroups.indexOf(group) < 0) {
    // skip this taxa because not in the searched informal groups
    return false;
  }
  return true;
}

function searchWordIndex(
  results: Taxon[],
  species: Genera,
  wordIndex: NamePointer[],
  searchPhrase: string,
  firstWordRegex: RegExp,
  otherWordsRegex: RegExp | undefined,
  wordCount: number,
  maxResults: number,
  informalGroups: number[]
) {
  // find first match in array
  let pointersArrayIndex = findFirstMatching(
    species,
    wordIndex,
    searchPhrase,
    wordCount
  );

  if (!pointersArrayIndex || pointersArrayIndex < 0) {
    return;
  }

  while (pointersArrayIndex < wordIndex.length) {
    if (results.length >= maxResults) return;

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
  species: Genera,
  wordIndexArray: NamePointers,
  searchPhrase: string,
  maxResults: number,
  informalGroups: number[]
) {
  const results: Taxon[] = [];

  const { firstWordRegex } = getFirstWordRegex(searchPhrase);
  const { otherWordsRegex } = getOtherWordsRegex(searchPhrase);

  wordIndexArray.forEach((wordIndex, wordCount) => {
    if (results.length >= maxResults) return;

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
