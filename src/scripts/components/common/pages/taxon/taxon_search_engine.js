/** ****************************************************************************
 * Generates UKSI list search suggestions.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';

let species;
let loading = false;
let commonNamePointers;

const WAREHOUSE_INDEX = 0,
      GROUP_INDEX = 1,
      SCI_NAME_INDEX = 2, // in genera and above
      GENUS_COMMON_INDEX = 3,
      SPECIES_SCI_NAME_INDEX = 1, // in species and bellow
      SPECIES_COMMON_INDEX = 2, // in species and bellow
      SPECIES_COMMON_SYN_INDEX = 3; // in species and bellow
const MAX = 20;

const API = {
  init: function (callback) {
    function _prep() {
      species = window['species_list'];
      commonNamePointers = API._makeCommonNameMap();
      callback && callback();
    }

    if (!window['species_list']) {
      loading = true;
      require.ensure([], () => {
        loading = false;
        require('master_list.data');
        _prep();
      }, 'data');
    } else {
      _prep();
    }
  },

  /**
   * Returns an array of species in format
   {
     array_id: "Genus array index"
     species_id: "Species array index"
     species_name_id: "Species name index" //to know where found
     warehouse_id: "Warehouse id"
     group: "Species group"
     scientific_name: "Scientific name"
     common_name: "Common name"
     synonym: "Common name synonym"
   }
   */
  search: function (searchPhrase, callback) {
    if (!species) {
      if (!loading) {
        API.init(() => {
          API.search(searchPhrase, callback);
        });
      }
      return;
    }

    let results = [];

    // normalize the search phrase
    const normSearchPhrase = searchPhrase.toLowerCase();

    // check if scientific search
    let isScientific = API._isPhraseScientific(normSearchPhrase);
    if (isScientific) {
      // search sci names
      API.searchSciNames(species, normSearchPhrase, results);
    } else {
      // search common names
      results = API.searchCommonNames(species, commonNamePointers, normSearchPhrase);

      // if not enough
      if (results.length <= MAX) {
        // search sci names
        API.searchSciNames(species, normSearchPhrase, results);
      }
    }

    // return results in the order
    callback(results);
  },

  /**
   * Search Scientific names
   * @param species
   * @param searchPhrase
   * @returns {Array}
   */
  searchSciNames(species, searchPhrase, results = [], maxResults = MAX, hybridRun) {
    const searchWords = searchPhrase.split(' ');

    // prepare first word regex
    let firstWord = API._normalizeFirstWord(searchWords[0]);
    let firstWordRegexStr = API._getFirstWordRegexString(firstWord);
    let firstWordRegex = new RegExp(firstWordRegexStr, 'i');

    // prepare other words regex
    let otherWords = searchWords.splice(1).join(' ');
    let otherWordsRegex;
    if (otherWords) {
      otherWordsRegex = new RegExp('^' + API._getOtherWordsRegexString(otherWords), 'i');
    }

    // check if hybrid eg. X Cupressocyparis
    if (!hybridRun && searchPhrase.match(/X\s.*/i)) {
      API.searchSciNames(species, searchPhrase, results, maxResults, true);
    } else if (hybridRun) {
      // run with different first word
      firstWord = API._normalizeFirstWord(searchPhrase);
      firstWordRegexStr = API._getFirstWordRegexString(firstWord);
      firstWordRegex = new RegExp(firstWordRegexStr, 'i');
      otherWords = null;
      otherWordsRegex = null;
    }

    // find first match in array
    let speciesArrayIndex = API._findFirstMatching(species, firstWord);

    // go through all
    const speciesArrayLength = species.length;
    while (speciesArrayIndex && speciesArrayIndex < speciesArrayLength && results.length < maxResults) {
      const speciesEntry = species[speciesArrayIndex];
      // check if matches
      if (firstWordRegex.test(speciesEntry[SCI_NAME_INDEX])) {
        // find species array
        let species_array;
        for (let j = 0, length = speciesEntry.length; j < length; j++) {
          if (speciesEntry[j] instanceof Array) {
            species_array = speciesEntry[j];
          }
        }

        let fullRes;
        if (!otherWordsRegex) {
          // no need to add genus if searching for species
          fullRes = {
            array_id: speciesArrayIndex,
            found_in_name: 'scientific_name',
            warehouse_id: speciesEntry[WAREHOUSE_INDEX],
            group: speciesEntry[GROUP_INDEX],
            scientific_name: speciesEntry[SCI_NAME_INDEX],
          };
          results.push(fullRes);
        }

        // if this is genus
        if (species_array) {
          // go through all species
          for (let species_index = 0, length = species_array.length; species_index < length && results.length < maxResults; species_index++) {
            let speciesInArray = species_array[species_index];
            if (otherWordsRegex) {
              // if search through species
              // check if matches
              if (otherWordsRegex.test(speciesInArray[SPECIES_SCI_NAME_INDEX])) {
                // add full sci name
                fullRes = {
                  array_id: speciesArrayIndex,
                  species_id: species_index,
                  found_in_name: 'scientific_name',
                  warehouse_id: speciesInArray[WAREHOUSE_INDEX],
                  group: speciesEntry[GROUP_INDEX],
                  scientific_name: speciesEntry[SCI_NAME_INDEX] + ' ' + speciesInArray[SPECIES_SCI_NAME_INDEX],
                  common_name: speciesInArray[SPECIES_COMMON_INDEX],
                  synonym: speciesInArray[SPECIES_COMMON_SYN_INDEX],
                };
                results.push(fullRes);
              }
            } else {
              // if only genus search add its species
              fullRes = {
                array_id: speciesArrayIndex,
                species_id: species_index,
                found_in_name: 'scientific_name',
                warehouse_id: speciesInArray[WAREHOUSE_INDEX],
                group: speciesEntry[GROUP_INDEX],
                scientific_name: speciesEntry[SCI_NAME_INDEX] + ' ' + speciesInArray[SPECIES_SCI_NAME_INDEX],
                common_name: speciesInArray[SPECIES_COMMON_INDEX],
                synonym: speciesInArray[SPECIES_COMMON_SYN_INDEX],
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
  },

  _normalizeFirstWord: function (phrase) {
    // replace all non alphanumerics with open character

    return phrase.replace('.', '');
  },

  _removeNonAlphanumerics(phrase) {
    return phrase.replace(/\\[\-\'\"()\\]/g, '.?');
  },

  // todo: change èéöüáöëïåß -> eeou..
  _getFirstWordRegexString: function (phrase) {
    phrase = API._escapeRegExp(phrase);
    phrase = API._removeNonAlphanumerics(phrase);
    return '^' + phrase + '.*';
  },

  _getOtherWordsRegexString: function (phrase) {
    phrase = API._escapeRegExp(phrase);
    phrase = API._removeNonAlphanumerics(phrase);

    let words = phrase.split(' ');

    _.each(words, function (word, i) {
      // check if word is ssp. var. etc

      // remove leading dot with .*
      let leading = word.replace(/\\\.([a-zA-Z]*)\b/i, '.*$1');
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
   * Search for Common names
   * @param species
   * @param commonNamePointers
   * @param searchPhrase
   * @returns {Array}
   */
  searchCommonNames: function (species, commonNamePointers, searchPhrase, results = [], maxResults = MAX) {
    let searchWords = searchPhrase.split(' ');

    // prepare first word regex
    let firstWord = API._normalizeFirstWord(searchWords[0]);
    let firstWordRegexStr = API._getFirstWordRegexString(firstWord);
    let firstWordRegex = new RegExp(firstWordRegexStr, 'i');

    // prepare other words regex
    let otherWords = searchWords.splice(1).join(' ');
    let otherWordsRegexStr;
    if (otherWords) {
      otherWordsRegexStr = API._getOtherWordsRegexString(otherWords);
    }

    let regex = new RegExp(firstWordRegexStr + (otherWordsRegexStr ? otherWordsRegexStr : ''), 'i');

    let pointerArrayLength = commonNamePointers.length;

    // find first match in array
    let pointers_array_index = API._findFirstMatching(commonNamePointers, searchPhrase, true);

    // go through all pointers
    while (pointers_array_index && pointers_array_index < pointerArrayLength && results.length < maxResults) {
      let p = commonNamePointers[pointers_array_index];
      if (API._isGenusPointer(p)) {
        let genus = species[p[0]];
        if (regex.test(genus[GENUS_COMMON_INDEX])) {
          // check if matches full phrase
            let fullRes = {
              array_id: p[0],
              found_in_name: 'common_name',
              warehouse_id: genus[WAREHOUSE_INDEX],
              group: genus[GROUP_INDEX],
              scientific_name: genus[SCI_NAME_INDEX],
              common_name: genus[GENUS_COMMON_INDEX],
            };
            results.push(fullRes);

        }
      } else {
        let species_genus = species[p[0]];
        let speciesEntry = species_genus[p[1]][p[2]];
        // carry on while it matches the first name
        let found_in_name = p[3] == SPECIES_COMMON_SYN_INDEX ? 'synonym' : 'common_name';
        if (firstWordRegex.test(speciesEntry[p[3]])) {
          // check if matches full phrase
          if (regex.test(speciesEntry[p[3]])) {
            let fullRes = {
              array_id: p[0],
              species_id: p[1],
              found_in_name,
              warehouse_id: speciesEntry[WAREHOUSE_INDEX],
              group: species_genus[GROUP_INDEX],
              scientific_name: species_genus[SCI_NAME_INDEX] + ' ' + speciesEntry[SPECIES_SCI_NAME_INDEX],
              common_name: speciesEntry[SPECIES_COMMON_INDEX],
              synonym: speciesEntry[SPECIES_COMMON_SYN_INDEX]
            };
            results.push(fullRes);
          }
        } else {
          // stop looking further if not found
          break;
        }
      }
      pointers_array_index++;
    }
    return results;
  },

  /**
   * Escape string for using in regex.
   * @param string
   * @returns {*}
   * @private
   */
  _escapeRegExp: function (string) {
    return string.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * Checks if the search phrase is targeting scientific names.
   * @returns {boolean}
   * @private
   */
  _isPhraseScientific: function (searchPhrase) {
    let check = [
      ' ssp\.? ',
      ' subsect\.? ',
      ' nothovar\.? '
    ];

    let re = new RegExp(check.join('|'), 'i');
    return re.test(searchPhrase);
  },

  /**
   * Finds first match in array.
   * @param searchArray sorted array to find the first match
   * @param searchPhrase
   * @param commonName true/false if provided common name pointer array
   * @returns index of the first match in the array
   */
  _findFirstMatching: function (searchArray, searchPhrase, commonName = false) {
    let comparator = function (index) {
      let AFTER = -1, BEFORE = 1, EQUAL = 0;
      let value, prevValue;

      // get values to compare
      if (!commonName) {
        value = searchArray[index][SCI_NAME_INDEX].toLowerCase();
        if (index > 0) {
          prevValue = searchArray[index - 1][SCI_NAME_INDEX].toLowerCase();
        }
      } else {
        // common name from pointer
        searchPhrase = searchPhrase.split(' ')[0];
        let p = searchArray[index];

        value = API._getCommonName(p);
        if (index > 0) {
          p = searchArray[index - 1];
          prevValue = API._getCommonName(p);
        }
      }

      // check if found first entry in array
      let matchRe = new RegExp('^' + searchPhrase, 'i');
      if (matchRe.test(value)) {
        // check if prev entry matches
        if (prevValue) {
          if (matchRe.test(prevValue)) {
            return BEFORE; // matches but not the first match
          } else {
            return EQUAL; // found first entry
          }
        } else {
          // no prev entry
          return EQUAL; // found first entry
        }
      }

      // compare
      if (searchPhrase > value) {
        return AFTER;
      } else {
        return BEFORE;
      }
    };

    return API._binarySearch(searchArray, comparator);
  },

  /**
   * Binary search.
   * Find the index of the first matching entry in array
   * O(Log n) (30K - lookup 14 times)
   */
  _binarySearch: function (array, comparator, low, high) {
    // initial set up
    low = low || 0;
    high = high || array.length;

    // checkup
    if (high < low) {
      return null;
    }

    let mid = parseInt((low + high) / 2);
    let campared = comparator(mid);
    if (campared > 0) {
      return API._binarySearch(array, comparator, low, mid - 1);
    } else if (campared < 0) {
      return API._binarySearch(array, comparator, mid + 1, high);
    } else {
      return mid;
    }
  },

  _isGenusPointer: function (p) {
    return p.length === 2;
  },

  /**
   * Return common name from common names array pointer
   * @param p array pointer
   */
  _getCommonName: function (p) {
    let name;
    if (API._isGenusPointer(p)) {
      // genus common name
      name = species[p[0]][p[1]];
    } else {
      name = species[p[0]][p[1]][p[2]][p[3]];
    }
    return name.toLowerCase();
  },

  /**
   * Extract common names as pointers in an array
   */
  _makeCommonNameMap: function () {
    let species_list = window['species_list'];
    let common_names = [];

    for (let i = 1, length = species_list.length; i < length; i++) {
      let speciesEntry = species_list[i];

      // if genus
      if (typeof speciesEntry[GENUS_COMMON_INDEX] === 'string') {
        // genus has a common name
        common_names.push([i, GENUS_COMMON_INDEX]);
        continue;
      }

      // find species array
      let species_array;
      let j = 0;
      for (let length = speciesEntry.length; j < length; j++) {
        if (speciesEntry[j] instanceof Array) {
          species_array = speciesEntry[j];
          break;
        }
      }

      if (species_array) {
        for (let k = 0, species_length = species_array.length; k < species_length; k++) {
          let speciesInArray = species_array[k];
          if (speciesInArray[SPECIES_COMMON_INDEX]) {
            common_names.push([i, j, k, SPECIES_COMMON_INDEX]);
          }
          if (speciesInArray[SPECIES_COMMON_SYN_INDEX]) {
            common_names.push([i, j, k, SPECIES_COMMON_SYN_INDEX]);
          }
        }
      }
    }

    common_names.sort(function (a, b) {
      let spA = API._getCommonName(a);
      let spB = API._getCommonName(b);

      if (spA > spB) {
        return 1;
      } else if (spA < spB) {
        return -1;
      } else {
        return 0;
      }
    });

    return common_names;
  }
};

export { API as default };
