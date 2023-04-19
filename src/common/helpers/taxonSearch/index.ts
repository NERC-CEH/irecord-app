/** ****************************************************************************
 * Generates species list suggestions.
 **************************************************************************** */
import searchCommonNames from './commonNamesSearch';
import searchSciNames from './scientificNamesSearch';
import { isPhraseScientific } from './searchHelpers';

type SpeciesId = number;
type SpeciesName = string;
type SpeciesCommonName = string;
export type Species = { 0: SpeciesId; 1: SpeciesName; 2?: SpeciesCommonName[] };

type GenusId = number;
type GroupId = number;
type GenusName = string;
type GenusCommonName = string;
export type Genus = {
  0: GenusId;
  1: GroupId;
  2: GenusName;
  3?: Species[];
  4?: GenusCommonName[];
};

export type Genera = Genus[];

let species: Genera;
type GenusIndex = number;
type SpeciesIndex = number;
type NameIndex = number;
export type GenusNamePointer = { 0: GenusIndex; 1: NameIndex };
export type CommonNamePointer = {
  0: GenusIndex;
  1: SpeciesIndex;
  2: NameIndex;
};
export type NamePointer = GenusNamePointer | CommonNamePointer;
export type NamePointers = NamePointer[][];
let commonNamePointers: NamePointers;

const loadData = async () => {
  const { default: data } = await import(
    /* webpackChunkName: "data" */ 'common/data/species.data.json'
  );
  species = data as any;
  const { default: pointersData } = await import(
    /* webpackChunkName: "data" */ 'common/data/species_names.data.json'
  );
  commonNamePointers = pointersData as any;
};

const MAX = 20;

/* Species dictionary load. */
let _init: any;

export type Options = {
  maxResults?: number;
  namesFilter?: '' | 'scientific' | 'common';
  informalGroups?: number[];
};

export type Taxon = {
  warehouse_id: number;
  group: number;
  scientific_name: string;
  common_names: string[];

  /**
   * Where in the genera array the search result was found.
   */
  array_id?: number;
  /**
   * Where in the species array the search result was found.
   */
  species_id?: number;
  /**
   * Which common_names array index to use if any.
   */
  found_in_name?: number;
};

export type SearchResults = Taxon[];

/**
 * Returns an array of species in format
 */
// todo Accent Folding: https://alistapart.com/article/accent-folding-for-auto-complete
export default async function search(
  searchPhrase: string,
  options: Options = {}
): Promise<SearchResults> {
  if (!species || !commonNamePointers) {
    if (!_init) _init = loadData();
    await _init;
  }

  let results: any = [];

  if (!searchPhrase) return results;

  let maxResults = options.maxResults || MAX;
  const scientificOnly = options.namesFilter === 'scientific';
  const skipSciNames = options.namesFilter === 'common';
  const informalGroups = options.informalGroups || [];

  // normalize the search phrase
  const normSearchPhrase = searchPhrase.toLowerCase();

  // check if scientific search
  const isScientific = isPhraseScientific(normSearchPhrase);
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
      false,
      informalGroups
    );
    results = [...results, ...foundSciNames];
  }

  return results;
}
