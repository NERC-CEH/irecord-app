import { Model, ModelData } from '@flumens';
import { mainStore } from 'models/store';
import AttributeLockExtension from './attrLockExt';
import PastLocationsExtension from './pastLocExt';

export type Data = ModelData & {
  showWelcome: boolean;
  language: string;

  locations: any[];
  attrLocks: any;
  autosync: boolean;
  useTraining: boolean;

  useExperiments: boolean;
  useGridNotifications: boolean;
  gridSquareUnit: 'monad';
  speciesListSortedByTime: boolean;

  showSurveysDeleteTip: boolean;
  shownLockingSwipeTip: boolean;
  showPastLocationsTip: boolean;
  showSurveyOptionsTip: boolean;
  feedbackGiven: boolean;
  taxonSearchGroupFilters: number[][];
  searchNamesOnly: '' | 'scientific' | 'common';
  sendAnalytics: boolean;
  appSession: number;

  useSpeciesImageClassifier: boolean;

  /**
   * Reset attribute locks.
   */
  attrLocksCleanedV620: boolean; // TODO: remove

  showVerifiedRecordsNotification: boolean;
  verifiedRecordsTimestamp: null | number;
};

export const defaults: Data = {
  showWelcome: true,
  language: 'EN',

  locations: [],
  attrLocks: { default: {}, complex: {} },
  attrLocksCleanedV620: false,
  autosync: true,
  useTraining: false,

  useExperiments: false,
  useGridNotifications: false,
  gridSquareUnit: 'monad',
  speciesListSortedByTime: true,

  showSurveysDeleteTip: true,
  shownLockingSwipeTip: false,
  showPastLocationsTip: true,
  showSurveyOptionsTip: true,
  feedbackGiven: false,
  taxonSearchGroupFilters: [],
  searchNamesOnly: '',
  sendAnalytics: true,
  appSession: 0,

  useSpeciesImageClassifier: true,

  showVerifiedRecordsNotification: true,
  verifiedRecordsTimestamp: null,
};

export class AppModel extends Model<Data> {
  isAttrLocked: any; // from extension

  getAttrLock: any; // from extension

  setAttrLock: any; // from extension

  unsetAttrLock: any; // from extension

  appendAttrLocks: any; // from extension

  getAllLocks: any; // from extension

  setLocation!: (newLocation: any) => void; // from extension

  removeLocation: any; // from extension

  printLocation: any; // from extension

  constructor(options: any) {
    super({ ...options, data: { ...defaults, ...options.data } });

    this.ready.then(() => {
      if (!this.data.attrLocksCleanedV620) {
        this.data.attrLocks = { default: {}, complex: {} };
        this.data.attrLocksCleanedV620 = true;
        this.save();
      }
    });

    Object.assign(this, PastLocationsExtension);
    Object.assign(this, AttributeLockExtension);
  }

  reset() {
    return super.reset(defaults);
  }
}

const appModel = new AppModel({ id: 'app', cid: 'app', store: mainStore });

export default appModel;
