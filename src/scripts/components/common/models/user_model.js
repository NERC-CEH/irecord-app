/** ****************************************************************************
 * User model describing the user model on backend. Persistent.
 *****************************************************************************/
import _ from 'lodash';
import Backbone from 'backbone';
import Store from '../../../../vendor/backbone.localStorage/js/backbone.localStorage';
import Validate from '../../../helpers/validate';
import CONFIG from 'config'; // Replaced with alias

const UserModel = Backbone.Model.extend({
  id: 'user',

  defaults: {
    name: '',
    surname: '',
    email: '',
    secret: '',
  },

  localStorage: new Store(CONFIG.name),

  /**
   * Initializes the user.
   */
  initialize() {
    this.fetch();
  },

  /**
   * Resets the user login information.
   */
  logOut() {
    this.set('email', '');
    this.set('secret', '');
    this.set('name', '');
    this.set('surname', '');
    this.save();
    this.trigger('logout');
  },

  /**
   * Sets the app login state of the user account.
   * Saves the user account details into storage for permanent availability.
   *
   * @param user User object or empty object
   */
  logIn(user) {
    this.set('secret', user.secret || '');
    this.setContactDetails(user);
    this.save();
    this.trigger('login');
  },

  /**
   * Sets user contact information.
   */
  setContactDetails(user) {
    this.set('email', user.email || '');
    this.set('name', user.name || '');
    this.set('surname', user.surname || '');
    this.save();
  },

  /**
   * Returns user contact information.
   */
  hasLogIn() {
    return this.get('secret');
  },

  appendSampleUser(sample) {
    sample.set('email', this.get('email'));
    sample.set('usersecret', this.get('secret'));

    return sample;
  },

  validateRegistration(attrs) {
    const errors = {};

    if (!attrs.email) {
      errors.email = "can't be blank";
    } else {
      if (!Validate.email(attrs.email)) {
        errors.email = 'invalid';
      }
    }

    if (!attrs.firstname) {
      errors.firstName = "can't be blank";
    }
    if (!attrs.secondname) {
      errors.secondname = "can't be blank";
    }

    if (!attrs.password) {
      errors.password = "can't be blank";
    } else {
      if (attrs.password.length < 2) {
        errors.password = 'is too short';
      }
    }


    if (!attrs['password-confirm']) {
      errors['password-confirm'] = "can't be blank";
    } else {
      if (attrs['password-confirm'] !== attrs.password) {
        errors['password-confirm'] = 'passwords are not equal';
      }
    }

    if (!attrs['terms-agree']) {
      errors['terms-agree'] = 'you must agree to the terms';
    }

    if (! _.isEmpty(errors)) {
      return errors;
    }

    return null;
  },

  validateLogin(attrs) {
    const errors = {};

    if (!attrs.email) {
      errors.email = "can't be blank";
    } else {
      if (!Validate.email(attrs.email)) {
        errors.email = 'invalid';
      }
    }

    if (!attrs.password) {
      errors.password = "can't be blank";
    }

    if (! _.isEmpty(errors)) {
      return errors;
    }

    return null;
  },
});

const userModel = new UserModel();
export {userModel as default, UserModel};
