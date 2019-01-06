/** ****************************************************************************
 * User model describing the user model on backend. Persistent.
 **************************************************************************** */
import Backbone from 'backbone';
import Analytics from 'helpers/analytics';
import Log from 'helpers/log';
import { observable, set as setMobXAttrs } from 'mobx';
import { getStore } from 'common/store';
import activitiesExtension from './user_model_activities_ext';
import statisticsExtension from './user_model_statistics_ext';

const getDefaultAttrs = () => ({
  isLoggedIn: false,
  drupalID: '',
  name: '',
  firstname: '',
  secondname: '',
  email: '',
  password: '',

  activities: [],

  statistics: {
    synced_on: null,
    species: [],
    speciesRaw: [],
  },
});

class UserModel {
  @observable attrs = getDefaultAttrs();

  constructor() {
    Log('UserModel: initializing');

    this._init = getStore()
      .then(store => store.getItem('user'))
      .then(userStr => {
        const user = JSON.parse(userStr);
        if (!user) {
          Log('UserModel: persisting for the first time');
          this.save();
        } else {
          setMobXAttrs(this.attrs, user.attrs);
        }

        this.statisticsExtensionInit();
        this.activitiesExtensionInit();
      });
  }

  get(name) {
    return this.attrs[name];
  }

  set(name, value) {
    this.attrs[name] = value;
    return this;
  }

  save() {
    const userStr = JSON.stringify({
      attrs: this.attrs,
    });
    return getStore().then(store => store.setItem('user', userStr));
  }

  /**
   * Resets the user login information.
   */
  logOut() {
    setMobXAttrs(this.attrs, getDefaultAttrs());
    return this.save();
  }

  /**
   * Sets the app login state of the user account.
   * Saves the user account details into storage for permanent availability.
   *
   * @param user User object or empty object
   */
  logIn(user) {
    Log('UserModel: logging in.');

    this.set('drupalID', user.id || '');
    this.set('password', user.password || '');
    this.set('email', user.email || '');
    this.set('name', user.name || '');
    this.set('firstname', user.firstname || '');
    this.set('secondname', user.secondname || '');
    this.set('isLoggedIn', true);

    this.syncActivities();
    this.syncStats();

    Analytics.trackEvent('User', 'login');

    return this.save();
  }

  /**
   * Returns user contact information.
   */
  hasLogIn() {
    return this.attrs.isLoggedIn;
  }

  getUser() {
    return this.get('email');
  }

  getPassword() {
    return this.get('password');
  }

  resetDefaults() {
    return this.logOut();
  }
}

// add activities management
UserModel.prototype = Object.assign(UserModel.prototype, activitiesExtension);

// add statistics management
UserModel.prototype = Object.assign(UserModel.prototype, statisticsExtension);

// for legacy support
UserModel.prototype = Object.assign(UserModel.prototype, Backbone.Events);

const userModel = new UserModel();
export { userModel as default, UserModel };
