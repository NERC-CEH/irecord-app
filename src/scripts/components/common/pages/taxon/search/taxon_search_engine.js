/** ****************************************************************************
 * Generates UKSI list search suggestions.
 *****************************************************************************/
import makeCommonNameMap from './commonNameMap';
import searchCommonNames from './commonNamesSearch';
import searchSciNames from './scientificNamesSearch';
import helpers from './searchHelpers';

let species;
let loading = false;
let commonNamePointers;

const MAX = 20;

const API = {
  init(callback) {
    function _prep() {
      species = window.species_list;
      commonNamePointers = makeCommonNameMap();
      callback && callback();
    }

    if (!window.species_list) {
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
  search(searchPhrase, callback) {
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
    const isScientific = helpers.isPhraseScientific(normSearchPhrase);
    if (isScientific) {
      // search sci names
      searchSciNames(species, normSearchPhrase, results);
    } else {
      // search common names
      results = searchCommonNames(species, commonNamePointers, normSearchPhrase);

      // if not enough
      if (results.length <= MAX) {
        // search sci names
        searchSciNames(species, normSearchPhrase, results);
      }
    }

    // return results in the order
    callback(results);
  },
};

export { API as default };
