import { extendObservable } from 'mobx';

type Model = 'smp' | 'occ';
type Taxon = string | null | undefined;
export type Locks = Partial<Record<Model, Record<string, unknown>>>;
export type AttrLocks = Record<string, Record<string, unknown>>;

const needsTaxon = (survey: string) => ['default', 'list'].includes(survey);

export default (getLocks: () => AttrLocks, save: () => void) => {
  const getAll = (survey: string, taxon?: Taxon): Locks => {
    const locks = getLocks();

    if (!survey || (needsTaxon(survey) && !taxon))
      throw new Error(`taxon group is required for survey ${survey}`);

    const surveyLocks = locks[survey];
    const taxonLocks = (taxon ? surveyLocks?.[taxon] : surveyLocks) as
      | Locks
      | undefined;
    const all = (taxon ? surveyLocks?.all : undefined) as Locks | undefined;

    return {
      smp: { ...all?.smp, ...taxonLocks?.smp },
      occ: { ...all?.occ, ...taxonLocks?.occ },
    };
  };

  const set = async (
    survey: string,
    taxon: Taxon,
    model: Model,
    attr: string,
    value: unknown
  ) => {
    const locks = getLocks();

    if (needsTaxon(survey) && !taxon)
      throw new Error(`taxon group is required for survey ${survey}`);

    if (!locks[survey]) extendObservable(locks, { [survey]: {} });

    const surveyLocks = locks[survey];
    if (taxon && !surveyLocks[taxon]) {
      extendObservable(surveyLocks, { [taxon]: {} });
    }

    const taxonLocks = (taxon ? surveyLocks[taxon] : surveyLocks) as Locks;
    if (!taxonLocks[model]) extendObservable(taxonLocks, { [model]: {} });

    taxonLocks[model]![attr] = structuredClone(value);
    save();
  };

  const unset = async (
    survey: string,
    taxon: Taxon,
    model: Model,
    attr: string
  ) => {
    const locks = getLocks();

    if (needsTaxon(survey) && !taxon)
      throw new Error(`taxon group is required for survey ${survey}`);

    const surveyLocks = locks[survey];
    const taxonLocks = (taxon ? surveyLocks?.[taxon] : surveyLocks) as
      | Locks
      | undefined;
    delete taxonLocks?.[model]?.[attr];
    save();
  };

  function get<T = unknown>(
    survey: string,
    taxon: Taxon,
    model: Model,
    attr: string
  ) {
    return getAll(survey, taxon)[model]?.[attr] as T | undefined;
  }

  function isLocked(
    survey: string,
    taxon: Taxon,
    model: Model,
    attr: string,
    value?: unknown
  ) {
    const lockedValue = get(survey, taxon, model, attr);
    if (arguments.length < 5) return lockedValue !== undefined;
    if (value === undefined) return false; // if provided a value but undefined, then we say it is not locked

    return JSON.stringify(lockedValue) === JSON.stringify(value);
  }

  return {
    getAll,
    set,
    unset,
    get,
    isLocked,
  };
};
