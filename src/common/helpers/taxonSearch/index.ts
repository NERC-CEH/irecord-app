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
export type GenusNamePointer = [GenusIndex, NameIndex];
export type CommonNamePointer = [GenusIndex, SpeciesIndex, NameIndex];
export type NamePointer = GenusNamePointer | CommonNamePointer;
export type NamePointers = NamePointer[][];
let commonNamePointers: NamePointers;

function fromStaticData<T>(data: unknown) {
  return data as T;
}

const loadData = async () => {
  const { default: data } = await import(
    /* webpackChunkName: "data" */ 'common/data/species.data.json'
  );
  species = fromStaticData<Genera>(data);
  const { default: pointersData } = await import(
    /* webpackChunkName: "data" */ 'common/data/species_names.data.json'
  );
  commonNamePointers = fromStaticData<NamePointers>(pointersData);
};

const MAX = 20;

/* Species dictionary load. */
let initPromise: Promise<void> | undefined;

export type Options = {
  maxResults?: number;
  namesFilter?: '' | 'scientific' | 'common';
  informalGroups?: number[];
};

export type Taxon = {
  warehouseId: number;
  group: number;
  scientificName: string;
  commonNames: string[];

  /**
   * Where in the genera array the search result was found.
   */
  arrayId?: number;
  /**
   * Where in the species array the search result was found.
   */
  speciesId?: number;
  /**
   * Which commonNames array index to use if any.
   */
  foundInName?: number;
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
    if (!initPromise) initPromise = loadData();
    await initPromise;
  }

  let results: SearchResults = [];

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
