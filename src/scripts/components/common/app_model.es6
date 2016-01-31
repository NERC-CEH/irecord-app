/******************************************************************************
 * App model. Persistent.
 *****************************************************************************/
define([
  'backbone',
  'backbone.localStorage',
  'app-config'
], function (Backbone, Store, CONFIG) {

  'use strict';

  var App = Backbone.Model.extend({
    id: 'app',

    defaults: {
      locations: [],
      attrLocks: {},
      useScientificNames: false,
      autosync: true,
      useGridRef: true
    },

    localStorage: new Store(CONFIG.name),

    /**
     * Initializes the object.
     */
    initialize: function () {
      this.fetch();
      if (!this.get('appVer')) {
        this.save ('appVer', CONFIG.version);
      }
    },

    /**
     * Saves device location.
     *
     * @param location
     */
    setLocation: function (location = {}) {
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
     * Returns device location as Grid Reference.
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

    setAttrLock: function (attr, value) {
      let locks = this.get('attrLocks');

      locks[attr] = value;
      this.set(locks);
      this.trigger('change:attrLocks');
      this.save();
    },

    getAttrLock: function (attr) {
      let locks = this.get('attrLocks');
      return locks[attr];
    },

    isAttrLocked: function (attr, value) {
      let lockedVal = this.getAttrLock(attr);
      if (!lockedVal) return false; //has not been locked
      if (lockedVal === true) return true; //has been locked

      switch (attr) {
        case 'location':
          return value.latitude == lockedVal.latitude && value.longitude == lockedVal.longitude;
          break;
        default:
          return value == lockedVal;
      }
    },

    appendAttrLocks: function (sample) {
      var locks = this.get('attrLocks');
      let occurrence = sample.occurrences.at(0);

      _.each(locks, function (value, key) {
        //false or undefined
        if (!value) {
          return;
        }

        switch (key) {
          case 'location':
            sample.set('location', value);
            break;
          case 'date':
            //parse stringified date
            sample.set('date', new Date(value));
            break;
          case 'number':
            occurrence.set('number', value);
            break;
          case 'stage':
            occurrence.set('stage', value);
            break;
          case 'comment':
            occurrence.set('comment', value);
            break;
          default:
        }
      });
    }
  });

  return new App;
});