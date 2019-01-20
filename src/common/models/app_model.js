/** ****************************************************************************
 * App model. Persistent.
 **************************************************************************** */
import Backbone from 'backbone';
import Log from 'helpers/log';
import { observable, set as setMobXAttrs } from 'mobx';
import { getStore } from 'common/store';
import attributeLockExtension from './app_model_attr_lock_ext';
import pastLocationsExtension from './app_model_past_loc_ext';

const getDefaultAttrs = () => ({
  showWelcome: true,
  language: 'EN',

  locations: [],
  attrLocks: { general: {}, complex: {} },
  autosync: true,
  useGridRef: true,
  useGridMap: true,
  useTraining: false,

  useExperiments: false,
  useGridNotifications: false,
  gridSquareUnit: 'monad',

  feedbackGiven: false,
  taxonGroupFilters: [],
  searchNamesOnly: null,
});

class AppModel {
  @observable attrs = getDefaultAttrs();

  constructor() {
    Log('AppModel: initializing');
    this._init = getStore()
      .then(store => store.getItem('app'))
      .then(appStr => {
        const app = JSON.parse(appStr);
        if (!app) {
          Log('AppModel: persisting for the first time');
          this._initDone = true;
          this.save();
          return;
        }

        setMobXAttrs(this.attrs, app.attrs);
        this._initDone = true;
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

  save() {
    if (!this._initDone) {
      throw new Error(`App Model can't be saved before initialisation`);
    }
    const userStr = JSON.stringify({
      attrs: this.attrs,
    });
    return getStore().then(store => store.setItem('app', userStr));
  }

  resetDefaults() {
    setMobXAttrs(this.attrs, getDefaultAttrs());
    return this.save();
  }

  toggleTaxonFilter(filter) {
    const taxonGroupFilters = this.get('taxonGroupFilters');
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

// for legacy support
AppModel.prototype = Object.assign(AppModel.prototype, Backbone.Events);

const appModel = new AppModel();
export { appModel as default, AppModel };
