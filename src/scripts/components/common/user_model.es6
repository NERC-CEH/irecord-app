/******************************************************************************
 * User model. Persistent.
 *****************************************************************************/
define([
  'backbone',
  'app-config',
  'helpers/location',
  'backbone.localStorage',
  'latlon'
], function (Backbone, CONFIG, locHelp) {
  'use strict';

  var User = Backbone.Model.extend({
    id: 'user',

    defaults: {
      name: '',
      surname: '',
      email: '',
      secret: '',
      locations: []
    },

    /**
     * Initializes the user.
     */
    initialize: function () {
      this.fetch();
    },

    localStorage: new Store(CONFIG.name),

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

    /**
     * Saves user location.
     *
     * @param location
     */
    setLocation: function (location) {
      var MAX_LENGTH = 10; //max number of locations to store
      var locations = this.get('locations'),
          exists = false;

      //check if exists
      locations.forEach(function (loc) {
        if (loc.latitude === location.latitude && loc.longitude === location.longitude) {
          exists = true;
        }
      });

      if (!exists) {
        //add
        locations.splice(0, 0, location);
        if (locations.length > MAX_LENGTH) {
          locations.length = MAX_LENGTH
        }
        this.set('locations', locations);
        this.trigger('change:locations');
        this.save();
      }
    },

    /**
     * Returns user location as Grid Reference.
     *
     * @param geoloc
     * @returns {*}
     */
    getLocationSref: function (location) {
      var LOCATION_GRANULARITY = 2; //Precision of returned grid reference (6 digits = metres).

      location = location || this.get('locations')[0];
      if (!location) {
        return null;
      }

      //get translated location
      var gref = locHelp.coord2grid(location, LOCATION_GRANULARITY);

      //remove the spaces
      return gref.replace(/ /g, '');
    },

    appendSampleUser: function (sample) {
      sample.set('name', this.get('name') || '_');
      sample.set('surname', this.get('surname'));
      sample.set('email', this.get('email'));

      return sample;
    }
  });

  return new User();
});