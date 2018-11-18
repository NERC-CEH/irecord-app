/** ****************************************************************************
 * User model describing the user model on backend. Persistent.
 **************************************************************************** */
import Backbone from 'backbone';
import Store from 'backbone.localstorage';
import CONFIG from 'config';
import Analytics from 'helpers/analytics';
import Log from 'helpers/log';
import Validate from 'helpers/validate';
import _ from 'lodash';
import { observable } from 'mobx';
import activitiesExtension from './user_model_activities_ext';
import statisticsExtension from './user_model_statistics_ext';

let UserModel = Backbone.Model.extend({
  // eslint-disable-line
  id: 'user',

  defaults: {
    id: 'user',
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
      speciesRaw: []
    }
  },

  metadata: {
    synchronizingStatistics: null
  },

  localStorage: new Store(CONFIG.name),

  /**
   * Initializes the user.
   */
  initialize() {
    Log('UserModel: initializing');
    this.attributes = observable(this.attributes);
    this.metadata = observable(this.metadata);

    this.fetch();
    this.syncActivities();
    this.syncStats();
  },

  /**
   * Resets the user login information.
   */
  logOut() {
    Log('UserModel: logging out.');

    this.set('email', '');
    this.set('password', '');
    this.set('name', '');
    this.set('firstname', '');
    this.set('secondname', '');

    this.resetActivities();
    this.resetStats();

    this.save();
    this.trigger('logout');
    Analytics.trackEvent('User', 'logout');
  },

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
    this.save();

    this.trigger('login');
    this.syncActivities();
    this.syncStats();
    Analytics.trackEvent('User', 'login');
  },

  /**
   * Returns user contact information.
   */
  hasLogIn() {
    return this.get('password');
  },

  getUser() {
    return this.get('email');
  },

  getPassword() {
    return this.get('password');
  },

  validateRegistration(attrs) {
    const errors = {};

    if (!attrs.email) {
      errors.email = t("can't be blank");
    } else if (!Validate.email(attrs.email)) {
      errors.email = 'invalid';
    }

    if (!attrs.firstname) {
      errors.firstname = t("can't be blank");
    }

    if (!attrs.secondname) {
      errors.secondname = t("can't be blank");
    }

    if (!attrs.password) {
      errors.password = t("can't be blank");
    } else if (attrs.password.length < 2) {
      errors.password = t('is too short');
    }

    if (!attrs.passwordConfirm) {
      errors.passwordConfirm = t("can't be blank");
    } else if (attrs.passwordConfirm !== attrs.password) {
      errors.passwordConfirm = t('passwords are not equal');
    }

    if (!attrs.termsAgree) {
      errors.termsAgree = t('you must agree to the terms');
    }

    if (!_.isEmpty(errors)) {
      return errors;
    }

    return null;
  },

  validateLogin(attrs) {
    const errors = {};

    if (!attrs.name) {
      errors.name = t("can't be blank");
    }

    if (!attrs.password) {
      errors.password = t("can't be blank");
    }

    if (!_.isEmpty(errors)) {
      return errors;
    }

    return null;
  },

  validateReset(attrs) {
    const errors = {};

    if (!attrs.name) {
      errors.name = t("can't be blank");
    }

    if (!_.isEmpty(errors)) {
      return errors;
    }

    return null;
  },

  save(key, val, options) {
    let attrs;
    if (key == null || typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = _.extend({ validate: true, parse: true }, options);

    if (attrs) {
      if (!this.set(attrs, options)) return false;
    } else if (!this._validate(attrs, options)) {
      return false;
    }

    const method = this.isNew() ? 'create' : 'update';
    return this.sync(method, this, options);
  },
});

// add activities management
UserModel = UserModel.extend(activitiesExtension);

// add statistics management
UserModel = UserModel.extend(statisticsExtension);

const userModel = new UserModel();
export { userModel as default, UserModel };
