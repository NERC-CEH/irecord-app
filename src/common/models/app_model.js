/** ****************************************************************************
 * App model. Persistent.
 **************************************************************************** */
import Log from 'helpers/log';
import { observable, set as setMobXAttrs, toJS } from 'mobx';
import { store } from 'common/store';
import attributeLockExtension from './app_model_attr_lock_ext';
import pastLocationsExtension from './app_model_past_loc_ext';

const getDefaultAttrs = () => ({
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

  shownLongPressTip: false,
  shownLockingTip: false,
  feedbackGiven: false,
  taxonGroupFilters: [],
  searchNamesOnly: null,
  sendAnalytics: true,
  appSession: 0,
});

class AppModel {
  @observable attrs = getDefaultAttrs();

  constructor() {
    Log('AppModel: initializing');
    this._init = store
      .find('app')
      .then(app => {
        if (typeof app === 'string') {
          // backwards compatibility
          app = JSON.parse(app); // eslint-disable-line
        }

        if (!app) {
          Log('AppModel: persisting for the first time');
          this.save();
          return;
        }

        setMobXAttrs(this.attrs, app.attrs);
      })
      .then(() => this.attrLocksExtensionInit());
  }

  get(name) {
    return this.attrs[name];
  }

  set(name, value) {
    this.attrs[name] = value;
    return this;
  }

  async save() {
    return store.save('app', { attrs: toJS(this.attrs) });
  }

  resetDefaults() {
    setMobXAttrs(this.attrs, getDefaultAttrs());
    return this.save();
  }

  toggleTaxonFilter(filter) {
    const { taxonGroupFilters } = this.attrs;
    const index = taxonGroupFilters.indexOf(filter);
    if (index >= 0) {
      taxonGroupFilters.splice(index, 1);
    } else {
      taxonGroupFilters.push(filter);
    }

    this.save();
  }
}

// add previous/pased saved locations management
AppModel.prototype = Object.assign(AppModel.prototype, pastLocationsExtension);

// add sample/occurrence attribute management
AppModel.prototype = Object.assign(AppModel.prototype, attributeLockExtension);

const appModel = new AppModel();
export { appModel as default, AppModel };
