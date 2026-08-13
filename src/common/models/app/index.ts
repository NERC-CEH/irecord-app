import { Model, ModelData } from '@flumens';
import { mainStore } from 'models/store';
import lockExtension from './attrLockExt';
import PastLocationsExtension from './pastLocExt';

export type Data = ModelData & {
  showWelcome: boolean;
  language: string;

  locations: any[];
  _attrLocks: any;
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
  showPhotoCropTip: boolean;
  feedbackGiven: boolean;
  taxonSearchGroupFilters: number[][];
  searchNamesOnly: '' | 'scientific' | 'common';
  sendAnalytics: boolean;
  appSession: number;

  useSpeciesImageClassifier: boolean;

  showVerifiedRecordsNotification: boolean;
  verifiedRecordsTimestamp: null | number;
};

export const defaults: Data = {
  showWelcome: true,
  language: 'EN',

  locations: [],
  _attrLocks: {},
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
  showPhotoCropTip: true,
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
  locks = lockExtension(
    () => this.data._attrLocks,
    () => this.save()
  );

  setLocation!: (newLocation: any) => void; // from extension

  removeLocation: any; // from extension

  constructor(options: any) {
    super({ ...options, data: { ...defaults, ...options.data } });

    Object.assign(this, PastLocationsExtension);
  }

  reset() {
    return super.reset(defaults);
  }
}

const appModel = new AppModel({ id: 'app', cid: 'app', store: mainStore });

export default appModel;
