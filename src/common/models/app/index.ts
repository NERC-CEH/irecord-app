import { Model, ModelAttrs } from '@flumens';
import { genericStore } from 'models/store';
import AttributeLockExtension from './attrLockExt';
import PastLocationsExtension from './pastLocExt';

export type SurveyDraftKeys = {
  'draftId:default'?: null | string;
  'draftId:list'?: null | string;
  'draftId:moth'?: null | string;
  'draftId:plant'?: null | string;
};

export type Attrs = ModelAttrs & {
  showWelcome: boolean;
  language: string;

  locations: any[];
  attrLocks: any;
  autosync: boolean;
  useGridRef: boolean;
  useGridMap: boolean;
  useTraining: boolean;

  useExperiments: boolean;
  useGridNotifications: boolean;
  gridSquareUnit: 'monad';
  speciesListSortedByTime: boolean;
  geolocateSurveyEntries: boolean;

  showSurveysDeleteTip: boolean;
  shownLongPressTip: boolean;
  shownLockingTip: boolean;
  feedbackGiven: boolean;
  taxonGroupFilters: any[];
  searchNamesOnly: null;
  sendAnalytics: boolean;
  appSession: number;
} & SurveyDraftKeys;

export const defaults: Attrs = {
  showWelcome: true,
  language: 'EN',

  locations: [],
  attrLocks: { default: {}, complex: {} },
  autosync: true,
  useGridRef: true,
  useGridMap: true,
  useTraining: false,

  useExperiments: false,
  useGridNotifications: false,
  gridSquareUnit: 'monad',
  speciesListSortedByTime: false,
  geolocateSurveyEntries: true,

  // draft survey pointers
  'draftId:default': null,
  'draftId:list': null,
  'draftId:moth': null,
  'draftId:plant': null,

  showSurveysDeleteTip: true,
  shownLongPressTip: false,
  shownLockingTip: false,
  feedbackGiven: false,
  taxonGroupFilters: [],
  searchNamesOnly: null,
  sendAnalytics: true,
  appSession: 0,
};

export class AppModel extends Model {
  attrs: Attrs = Model.extendAttrs(this.attrs, defaults);

  isAttrLocked: any; // from extension

  getAttrLock: any; // from extension

  setAttrLock: any; // from extension

  unsetAttrLock: any; // from extension

  appendAttrLocks: any; // from extension

  getAllLocks: any; // from extension

  setLocation: any; // from extension

  removeLocation: any; // from extension

  printLocation: any; // from extension

  constructor(options: any) {
    super(options);

    Object.assign(this, PastLocationsExtension);
    Object.assign(this, AttributeLockExtension);
  }

  toggleTaxonFilter(filter: any) {
    const { taxonGroupFilters } = this.attrs;
    const index = taxonGroupFilters.indexOf(filter);
    if (index >= 0) {
      taxonGroupFilters.splice(index, 1);
    } else {
      taxonGroupFilters.push(filter);
    }

    this.save();
  }

  resetDefaults() {
    return super.resetDefaults(defaults);
  }
}

const appModel = new AppModel({ cid: 'app', store: genericStore });
export default appModel;
