/** ****************************************************************************
 *
 **************************************************************************** */
import _ from 'lodash';

const SCI_NAME_INDEX = 2; // in genera and above

const helpers = {
  normalizeFirstWord(phrase) {
    // replace all non alphanumerics with open character

    return phrase.replace('.', '');
  },

  removeNonAlphanumerics(phrase) {
    return phrase.replace(/\\[\-\'\"()\\]/g, '.?'); // eslint-disable-line
  },

  // todo: change èéöüáöëïåß -> eeou..
  getFirstWordRegexString(phraseOrig) {
    let phrase = helpers.escapeRegExp(phraseOrig);
    phrase = helpers.removeNonAlphanumerics(phrase);
    return `^${phrase}.*`;
  },

  getOtherWordsRegexString(phraseOrig) {
    let phrase = helpers.escapeRegExp(phraseOrig);
    phrase = helpers.removeNonAlphanumerics(phrase);

    const words = phrase.split(' ');

    _.each(words, (wordOrigin, i) => {
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
  },

  /**
   * Escape string for using in regex.
   * @param string
   * @returns {*}
   * @private
   */
  escapeRegExp(string) {
    return string.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * Checks if the search phrase is targeting scientific names.
   * @returns {boolean}
   * @private
   */
  isPhraseScientific(searchPhrase) {
    const check = [
      ' ssp.? ', // eslint-disable-line
      ' subsect.? ', // eslint-disable-line
      ' nothovar.? ', // eslint-disable-line
    ];

    const re = new RegExp(check.join('|'), 'i');
    return re.test(searchPhrase);
  },

  /**
   * Finds first match in array.
   * @param searchArray sorted array to find the first match
   * @param searchPhrase
   * @param commonName true/false if provided common name pointer array
   * @returns index of the first match in the array
   */
  findFirstMatching(species, searchArray, searchPhraseOrig, wordCount) {
    let searchPhrase = searchPhraseOrig;
    function comparator(index) {
      const AFTER = -1;
      const BEFORE = 1;
      const EQUAL = 0;
      let value;
      let prevValue;

      // get values to compare
      if (wordCount >= 0) {
        // common name from pointer
        searchPhrase = searchPhrase.split(' ')[0];
        let p = searchArray[index];

        value = helpers.getCommonName(species, p);
        // select word
        value = value.split(' ')[wordCount];

        // get a previous entry to compare against
        if (index > 0) {
          p = searchArray[index - 1];
          prevValue = helpers.getCommonName(species, p);
          // select word
          prevValue = prevValue.split(' ')[wordCount];
        }
      } else {
        value = searchArray[index][SCI_NAME_INDEX].toLowerCase();
        if (index > 0) {
          prevValue = searchArray[index - 1][SCI_NAME_INDEX].toLowerCase();
        }
      }

      // check if found first entry in array
      const matchRe = new RegExp(`^${helpers.escapeRegExp(searchPhrase)}`, 'i');
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

    return helpers.binarySearch(searchArray, comparator);
  },

  /**
   * Binary search.
   * Find the index of the first matching entry in array
   * O(Log n) (30K - lookup 14 times)
   */
  binarySearch(array, comparator, lowOrig, highOrig) {
    // initial set up
    const low = lowOrig || 0;
    let high = highOrig;
    if (high !== 0 && !high) {
      high = array.length - 1;
    }

    // checkup
    if (high < low) {
      return null;
    }

    const mid = parseInt((low + high) / 2, 10);
    const campared = comparator(mid);
    if (campared > 0) {
      return helpers.binarySearch(array, comparator, low, mid - 1);
    } else if (campared < 0) {
      return helpers.binarySearch(array, comparator, mid + 1, high);
    }
    return mid;
  },

  isGenusPointer(p) {
    return p.length === 2;
  },

  /**
   * Return common name from common names array pointer
   * @param p array pointer
   */
  getCommonName(species, p) {
    let name;
    if (helpers.isGenusPointer(p)) {
      // genus common name
      name = species[p[0]][p[1]];
    } else {
      name = species[p[0]][p[1]][p[2]][p[3]];
    }
    return name.toLowerCase();
  },
};

export { helpers as default };
