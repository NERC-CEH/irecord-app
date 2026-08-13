import { extendObservable } from 'mobx';

type Model = 'smp' | 'occ';
type Taxon = string | null | undefined;
type Locks = Partial<Record<Model, Record<string, any>>>;

const clone = (value: any) => JSON.parse(JSON.stringify(value));
const needsTaxon = (survey: string) => ['default', 'list'].includes(survey);

export default (getLocks: () => Record<string, any>, save: () => void) => {
  const getAll = (survey: string, taxon?: Taxon): Locks => {
    const locks = getLocks();

    if (!survey || (needsTaxon(survey) && !taxon))
      throw new Error(`taxon group is required for survey ${survey}`);

    const taxonLocks = taxon ? locks[survey]?.[taxon] : locks[survey];
    const all = taxon ? locks[survey]?.all : undefined;

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
    value: any
  ) => {
    const locks = getLocks();

    if (needsTaxon(survey) && !taxon)
      throw new Error(`taxon group is required for survey ${survey}`);

    if (!locks[survey]) extendObservable(locks, { [survey]: {} });

    const surveyLocks = locks[survey];
    if (taxon && !surveyLocks[taxon]) {
      extendObservable(surveyLocks, { [taxon]: {} });
    }

    const taxonLocks = taxon ? surveyLocks[taxon] : surveyLocks;
    if (!taxonLocks[model]) extendObservable(taxonLocks, { [model]: {} });

    taxonLocks[model][attr] = clone(value);
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

    const taxonLocks = taxon ? locks[survey]?.[taxon] : locks[survey];
    delete taxonLocks?.[model]?.[attr];
    save();
  };

  const get = (survey: string, taxon: Taxon, model: Model, attr: string) =>
    getAll(survey, taxon)[model]?.[attr];

  function isLocked(
    survey: string,
    taxon: Taxon,
    model: Model,
    attr: string,
    value?: any
  ) {
    const lockedValue = get(survey, taxon, model, attr);
    if (arguments.length < 5) return lockedValue !== undefined;

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
