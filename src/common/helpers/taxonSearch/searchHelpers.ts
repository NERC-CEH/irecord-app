import {
  GENUS_SPECIES_INDEX,
  GENUS_NAMES_INDEX,
  SPECIES_NAMES_INDEX,
} from 'common/data/constants';
import { Genera, NamePointer } from '.';

const SCI_NAME_INDEX = 2; // in genera and above

export function normalizeFirstWord(phrase: string) {
  // replace all non alphanumerics with open character

  return phrase.replace('.', '');
}

export function removeNonAlphanumerics(phrase: string) {
  return phrase.replace(/\\[-'"()\\]/g, '.?');
}

/** Escape string for use in a regular expression. */
export function escapeRegExp(string: string) {
  return string.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&');
}

// TODO: change èéöüáöëïåß -> eeou..
export function getFirstWordRegexString(phraseOrig: string) {
  let phrase = escapeRegExp(phraseOrig);
  phrase = removeNonAlphanumerics(phrase);
  return `^${phrase}.*`;
}

export function getOtherWordsRegexString(phraseOrig: string) {
  let phrase = escapeRegExp(phraseOrig);
  phrase = removeNonAlphanumerics(phrase);

  const words = phrase.split(' ');

  words.forEach((wordOrigin, i) => {
    let word = wordOrigin;
    // check if word is ssp. var. etc

    // remove leading dot with .*
    const leading = word.replace(/\\\.([a-zA-Z]*)\b/i, '.*$1');
    if (leading) {
      word = leading;
    }

    word = word.replace(/\b\\\./i, ''); // remove trailing dot

    // hybrids
    if (word !== '=') {
      word = word.replace(/.*/i, '\\b$&.*'); // make \b word .*
    } else {
      word = word.replace(/.*/i, '$&.*'); // make \b word .*
    }

    words[i] = word;
  });

  return words.join('');
}

export function getFirstWordRegex(searchPhrase: string) {
  const searchWords = searchPhrase.split(' ');
  const firstWord = normalizeFirstWord(searchWords[0]);
  const firstWordRegexStr = getFirstWordRegexString(firstWord);
  const firstWordRegex = new RegExp(firstWordRegexStr, 'i');
  return { firstWord, firstWordRegexStr, firstWordRegex };
}

export function getOtherWordsRegex(searchPhrase: string) {
  const searchWords = searchPhrase.split(' ');
  const otherWords = searchWords.splice(1).join(' ');
  if (!otherWords) return {};

  const otherWordsRegex = new RegExp(getOtherWordsRegexString(otherWords), 'i');
  return { otherWords, otherWordsRegex };
}

/**
 * Checks if the search phrase is targeting scientific names.
 * @returns {boolean}
 * @private
 */
export function isPhraseScientific(searchPhrase: string) {
  const check = [' ssp.? ', ' subsect.? ', ' nothovar.? '];

  const re = new RegExp(check.join('|'), 'i');
  return re.test(searchPhrase);
}

export function binarySearch(
  array: readonly unknown[],
  comparator: (index: number) => number,
  lowOrig?: number,
  highOrig?: number
): number {
  const low = lowOrig || 0;
  let high = highOrig;
  if (high !== 0 && !high) high = array.length - 1;
  if (high < low) return -1;

  const mid = Math.floor((low + high) / 2);
  const compared = comparator(mid);
  if (compared > 0) return binarySearch(array, comparator, low, mid - 1);
  if (compared < 0) return binarySearch(array, comparator, mid + 1, high);
  return mid;
}

export const isGenusPointer = (pointer: NamePointer) => pointer.length === 2;

export function getCommonName(
  allSpecies: Genera,
  pointer: NamePointer
): string {
  if (isGenusPointer(pointer)) {
    const [genusIndex, nameIndex] = pointer;
    return (
      allSpecies[genusIndex]?.[GENUS_NAMES_INDEX]?.[nameIndex].toLowerCase() ||
      ''
    );
  }

  const [genusIndex, speciesIndex, nameIndex] = pointer;
  return (
    allSpecies[genusIndex]?.[GENUS_SPECIES_INDEX]?.[speciesIndex]?.[
      SPECIES_NAMES_INDEX
    ]?.[nameIndex].toLowerCase() || ''
  );
}

/**
 * Finds first match in array.
 * @param searchArray sorted array to find the first match
 * @param searchPhrase
 * @param commonName true/false if provided common name pointer array
 * @returns index of the first match in the array
 */
export function findFirstMatching(
  species: Genera,
  searchArray: NamePointer[] | Genera,
  searchPhraseOrig: string,
  wordCount?: number
): number {
  let searchPhrase = searchPhraseOrig;

  function comparator(index: number) {
    const AFTER = -1;
    const BEFORE = 1;
    const EQUAL = 0;
    let value;
    let prevValue;

    const useNamePointers = Number.isFinite(wordCount) && wordCount! >= 0;
    if (useNamePointers) {
      const pointers = searchArray as NamePointer[];
      // common name from pointer
      [searchPhrase] = searchPhrase.split(' ');
      value = getCommonName(species, pointers[index]);
      // select word
      value = value.split(' ')[wordCount!];

      // get a previous entry to compare against
      if (index > 0) {
        prevValue = getCommonName(species, pointers[index - 1]);
        // select word
        prevValue = prevValue.split(' ')[wordCount!];
      }
    } else {
      const genera = searchArray as Genera;

      value = genera[index][SCI_NAME_INDEX].toLowerCase();
      if (index > 0) {
        prevValue = genera[index - 1][SCI_NAME_INDEX].toLowerCase();
      }
    }

    // check if found first entry in array
    const matchRe = new RegExp(`^${escapeRegExp(searchPhrase)}`, 'i');
    if (matchRe.test(value)) {
      // check if prev entry matches
      if (prevValue) {
        if (matchRe.test(prevValue)) {
          return BEFORE; // matches but not the first match
        }
        return EQUAL; // found first entry
      }
      // no prev entry
      return EQUAL; // found first entry
    }

    // compare
    if (searchPhrase > value) {
      return AFTER;
    }
    return BEFORE;
  }

  return binarySearch(searchArray, comparator);
}
