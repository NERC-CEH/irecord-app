/** ****************************************************************************
 * App model. Persistent.
 *****************************************************************************/
import Backbone from 'backbone';
import Store from 'backbone.localstorage';
import CONFIG from 'config';
import pastLocationsExtension from './app_model_past_loc_ext';
import attributeLockExtension from './app_model_attr_lock_ext';

const AppModel = Backbone.Model.extend({
  id: 'app',

  defaults: {
    exceptions: [],

    locations: [],
    attrLocks: {},
    autosync: true,
    useGridRef: true,
    useGridMap: true,
    useTraining: process.env.TRAINING,
  },

  localStorage: new Store(CONFIG.name),

  /**
   * Initializes the object.
   */
  initialize() {
    this.fetch();
    this.checkExpiredAttrLocks();
  },
});

// add previous/pased saved locations management
const AppModelLocations = AppModel.extend(pastLocationsExtension);
// add sample/occurrence attribute management
const AppModelLocationsLock = AppModelLocations.extend(attributeLockExtension);

const appModel = new AppModelLocationsLock();
export { appModel as default, AppModelLocationsLock as AppModel };
