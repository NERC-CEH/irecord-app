/** ****************************************************************************
 * Generates species list suggestions.
 **************************************************************************** */
import Backbone from 'backbone';
import _ from 'lodash';
import Log from 'helpers/log';
import searchCommonNames from './commonNamesSearch';
import searchSciNames from './scientificNamesSearch';
import helpers from './searchHelpers';

let species;
let loading = false;
let commonNamePointers;

const MAX = 20;

const API = {
  init() {
    Log('Taxon search engine: initializing.');

    return new Promise(resolve => {
      loading = true;
      require.ensure(
        [],
        () => {
          loading = false;
          species = require('species.data'); // eslint-disable-line
          commonNamePointers = require('species_names.data'); // eslint-disable-line
          this.trigger('data:loaded');
          resolve();
        },
        'data'
      );
    });
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
  search(searchPhrase, options = {}) {
    // todo Accent Folding: https://alistapart.com/article/accent-folding-for-auto-complete

    let results = [];

    if (!searchPhrase) {
      return Promise.resolve(results);
    }

    // check if data exists
    if (!species) {
      // initialise data load
      if (!loading) {
        return API.init().then(() => API.search(searchPhrase || '', options));
      }

      // wait until loaded
      return new Promise(resolve => {
        // the process has started, wait until done
        this.on('data:loaded', () => {
          API.search(searchPhrase || '', options).then(resolve);
        });
      });
    }

    const maxResults = options.maxResults || MAX;
    const scientificOnly = options.scientificOnly;
    const informalGroups = options.informalGroups || [];

    // normalize the search phrase
    const normSearchPhrase = searchPhrase.toLowerCase();

    // check if scientific search
    const isScientific = helpers.isPhraseScientific(normSearchPhrase);
    if (isScientific || scientificOnly) {
      // search sci names
      searchSciNames(
        species,
        normSearchPhrase,
        results,
        maxResults,
        null,
        informalGroups
      );
    } else {
      // search common names
      results = searchCommonNames(
        species,
        commonNamePointers,
        normSearchPhrase,
        MAX,
        informalGroups
      ); // eslint-disable-line

      // if not enough
      if (results.length <= MAX) {
        // search sci names
        searchSciNames(
          species,
          normSearchPhrase,
          results,
          MAX,
          null,
          informalGroups
        );
      }
    }

    // return results in the order
    return Promise.resolve(results);
  }
};

_.extend(API, Backbone.Events);

export { API as default };
