/******************************************************************************
 * User model describing the user model on backend. Persistent.
 *****************************************************************************/
define([
  'backbone',
  'backbone.localStorage',
  'validate',
  'app-config'
], function (Backbone, Store, Validate, CONFIG) {
  'use strict';

  var User = Backbone.Model.extend({
    id: 'user',

    defaults: {
      name: '',
      surname: '',
      email: '',
      secret: ''
    },

    localStorage: new Store(CONFIG.name),

    /**
     * Initializes the user.
     */
    initialize: function () {
      this.fetch();
    },

    /**
     * Resets the user login information.
     */
    logOut: function () {
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
    logIn: function (user) {
      this.set('secret', user.secret || '');
      this.setContactDetails(user);
      this.save();
      this.trigger('login');
    },

    /**
     * Sets user contact information.
     */
    setContactDetails: function (user) {
      this.set('email', user.email || '');
      this.set('name', user.name || '');
      this.set('surname', user.surname || '');
      this.save();
    },

    /**
     * Returns user contact information.
     */
    hasLogIn: function () {
      return this.get('secret');
    },

    appendSampleUser: function (sample) {
      sample.set('email', this.get('email'));
      sample.set('usersecret', this.get('secret'));

      return sample;
    },

    validateRegistration: function(attrs, options) {
      let errors = {};

      if (!attrs.email) {
        errors.email = "can't be blank";
      }else{
        if (!Validate.email(attrs.email)) {
          errors.email = "invalid";
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
      } else{
        if (attrs.password.length < 2) {
          errors.password = "is too short";
        }
      }


      if (!attrs['password-confirm']) {
        errors['password-confirm'] = "can't be blank";
      } else{
        if (attrs['password-confirm'] !== attrs.password) {
          errors['password-confirm'] = "passwords are not equal";
        }
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    }
  });

  return new User();
});