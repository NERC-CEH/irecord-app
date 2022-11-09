/** ****************************************************************************
 * Generates species list suggestions.
 **************************************************************************** */
import searchCommonNames from './commonNamesSearch';
import searchSciNames from './scientificNamesSearch';
import helpers from './searchHelpers';

let species;
let commonNamePointers;
const loadData = async () => {
  const { default: data } = await import(
    /* webpackChunkName: "data" */ 'common/data/species.data.json'
  );
  species = data;
  const { default: pointersData } = await import(
    /* webpackChunkName: "data" */ 'common/data/species_names.data.json'
  );
  commonNamePointers = pointersData;
};

const MAX = 20;

/**
 * Returns an array of species in format
 */
// todo Accent Folding: https://alistapart.com/article/accent-folding-for-auto-complete
export default async function search(searchPhrase, options = {}) {
  if (!species || !commonNamePointers) {
    if (!this._init) {
      this._init = loadData();
    }
    await this._init;
  }

  if (!searchPhrase) {
    return [];
  }

  let maxResults = options.maxResults || MAX;
  const scientificOnly = options.namesFilter === 'scientific';
  const skipSciNames = options.namesFilter === 'common';
  const informalGroups = options.informalGroups || [];

  // normalize the search phrase
  const normSearchPhrase = searchPhrase.toLowerCase();

  let results = [];

  // check if scientific search
  const isScientific = helpers.isPhraseScientific(normSearchPhrase);
  const skipCommonNames = isScientific || scientificOnly;
  if (!skipCommonNames) {
    const foundNames = searchCommonNames(
      species,
      commonNamePointers,
      normSearchPhrase,
      maxResults,
      informalGroups
    );
    results = [...foundNames];
  }

  maxResults -= results.length;
  if (!skipSciNames) {
    const foundSciNames = searchSciNames(
      species,
      normSearchPhrase,
      maxResults,
      null,
      informalGroups
    );
    results = [...results, ...foundSciNames];
  }

  return results;
}
