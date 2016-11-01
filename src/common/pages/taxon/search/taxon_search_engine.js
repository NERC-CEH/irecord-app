/** ****************************************************************************
 * Generates species list suggestions.
 *****************************************************************************/
import Backbone from 'backbone';
import _ from 'lodash';
import { Log } from 'helpers';
import searchCommonNames from './commonNamesSearch';
import searchSciNames from './scientificNamesSearch';
import helpers from './searchHelpers';

let species;
let loading = false;
let commonNamePointers;

const MAX = 20;

const API = {
  init(callback) {
    Log('Taxon search engine: initializing');
    const that = this;

    loading = true;
    require.ensure([], () => {
      loading = false;
      species = require('species.data');
      commonNamePointers = require('species_names.data');
      that.trigger('data:loaded');
      callback && callback();
    }, 'data');
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
  search(searchPhrase, callback, maxResults = MAX, scientificOnly) {
    if (!species) {
      // initialize
      function proceed() {
        API.search(searchPhrase || '', callback, maxResults, scientificOnly);
      }

      if (!loading) {
        API.init(proceed);
      } else {
        // the process has started, wait until done
        this.on('data:loaded', proceed);
      }
      return;
    }

    let results = [];

    // normalize the search phrase
    const normSearchPhrase = searchPhrase.toLowerCase();

    // check if scientific search
    const isScientific = helpers.isPhraseScientific(normSearchPhrase);
    if (isScientific || scientificOnly) {
      // search sci names
      searchSciNames(species, normSearchPhrase, results, maxResults);
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

_.extend(API, Backbone.Events);

export { API as default };
