import { Model, type ModelData, type ModelOptions } from '@flumens';
import { mainStore } from 'models/store';
import lockExtension, { type AttrLocks } from './attrLockExt';
import PastLocationsExtension, { type FullLocation } from './pastLocExt';

export type Data = ModelData & {
  showWelcome: boolean;
  language: string;

  locations: FullLocation[];
  _attrLocks: AttrLocks;
  autosync: boolean;
  useTraining: boolean;

  useExperiments: boolean;
  useGridNotifications: boolean;
  gridSquareUnit: 'monad' | 'tetrad';
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

  declare setLocation: (
    newLocation: FullLocation,
    allowedMaxSaved?: number
  ) => Promise<void>;

  declare removeLocation: (locationId: number) => Promise<void>;

  constructor(options: ModelOptions<Data>) {
    super({ ...options, data: { ...defaults, ...options.data } });

    Object.assign(this, PastLocationsExtension);
  }

  reset() {
    return super.reset(defaults);
  }
}

const appModel = new AppModel({ id: 'app', cid: 'app', store: mainStore });

export default appModel;
