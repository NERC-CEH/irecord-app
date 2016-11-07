/** ****************************************************************************
 * App model. Persistent.
 *****************************************************************************/
import Backbone from 'backbone';
import Store from 'backbone.localstorage';
import CONFIG from 'config';
import pastLocationsExtension from './app_model_past_loc_ext';
import attributeLockExtension from './app_model_attr_lock_ext';

let AppModel = Backbone.Model.extend({
  id: 'app',

  defaults: {
    exceptions: [],

    locations: [],
    attrLocks: {},
    autosync: true,
    useGridRef: true,
    useGridMap: true,
    useTraining: false,
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
AppModel = AppModel.extend(pastLocationsExtension);
// add sample/occurrence attribute management
AppModel = AppModel.extend(attributeLockExtension);

const appModel = new AppModel();
export { appModel as default, AppModel };
