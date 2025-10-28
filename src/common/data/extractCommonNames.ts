/** ****************************************************************************
 * Extract common names as pointers in an array.
 **************************************************************************** */
// eslint-disable-next-line import/extensions
import {
  GENUS_SPECIES_INDEX,
  GENUS_NAMES_INDEX,
  SPECIES_NAMES_INDEX,
} from './constants';

type GenusPointer = [number, number];
type SpeciesPointer = [number, number, number];
type NamePointer = GenusPointer | SpeciesPointer;
type NamePointers = NamePointer[][];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllSpecies = any[];

const isGenusPointer = (p: NamePointer): p is GenusPointer => {
  return p.length === 2;
};

/**
 * Return common name from common names array pointer
 * @param allSpecies - The species array
 * @param p - Array pointer
 */
const getCommonName = (allSpecies: AllSpecies, p: NamePointer): string => {
  if (isGenusPointer(p)) {
    const [genusIndex, nameIndex] = p;
    return allSpecies[genusIndex][GENUS_NAMES_INDEX][nameIndex].toLowerCase();
  }

  const [genusIndex, speciesIndex, nameIndex] = p;
  return allSpecies[genusIndex][GENUS_SPECIES_INDEX][speciesIndex][
    SPECIES_NAMES_INDEX
  ][nameIndex].toLowerCase();
};

/**
 * Splits a word and adds it to common names array
 * @param namePointers - The name pointers array
 * @param word - The word to split and add
 * @param index - The pointer indices
 */
const addWord = (
  namePointers: NamePointers,
  word: string,
  ...index: number[]
): void => {
  const words = word.split(' ');

  words.forEach((_: string, wordIndex: number) => {
    // eslint-disable-next-line no-param-reassign
    namePointers[wordIndex] = namePointers[wordIndex] || [];
    namePointers[wordIndex].push(index as NamePointer);
  });
};

const addGenusNamePointers = (
  namePointers: NamePointers,
  names: string[],
  genusIndex: number
): void => {
  names.forEach((name: string, nameIndex: number) =>
    addWord(namePointers, name, genusIndex, nameIndex)
  );
};

const addSpeciesNamePointers = (
  namePointers: NamePointers,
  speciesArray: AllSpecies,
  genusIndex: number
): void => {
  speciesArray.forEach((species: AllSpecies, speciesIndex: number) => {
    if (species[SPECIES_NAMES_INDEX]) {
      species[SPECIES_NAMES_INDEX].forEach((name: string, nameIndex: number) =>
        addWord(namePointers, name, genusIndex, speciesIndex, nameIndex)
      );
    }
  });
};

const getNamePointers = (genusArray: AllSpecies): NamePointers => {
  const namePointers: NamePointers = [];

  genusArray.forEach((speciesEntry: AllSpecies, genusIndex: number) => {
    const genusNamesArray = speciesEntry[GENUS_NAMES_INDEX] || [];
    addGenusNamePointers(namePointers, genusNamesArray, genusIndex);

    const speciesArray = speciesEntry[GENUS_SPECIES_INDEX] || [];
    addSpeciesNamePointers(namePointers, speciesArray, genusIndex);
  });

  return namePointers;
};

const sortPointers = (
  species: AllSpecies,
  namePointers: NamePointers
): void => {
  // sort within each name-word-count index
  const pointerSorter = (names: NamePointer[], nameIndex: number): void => {
    names.sort((a: NamePointer, b: NamePointer) => {
      let spA = getCommonName(species, a);
      let spB = getCommonName(species, b);

      // sort by name count
      const spAwords = spA.split(' ');
      spA = spAwords.slice(nameIndex, spAwords.length).join(' ');
      const spBwords = spB.split(' ');
      spB = spBwords.slice(nameIndex, spBwords.length).join(' ');

      if (spA > spB) {
        return 1;
      }

      if (spA < spB) {
        return -1;
      }

      return 0;
    });
  };

  namePointers.forEach(pointerSorter);
};

export default (species: AllSpecies): NamePointers => {
  // eslint-disable-next-line no-console
  console.log('Building name map...');

  const namePointers = getNamePointers(species);
  sortPointers(species, namePointers);

  return namePointers;
};
