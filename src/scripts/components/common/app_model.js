/** ****************************************************************************
 * App model. Persistent.
 *****************************************************************************/
import Backbone from 'backbone';
import _ from 'lodash';
import Store from '../../../vendor/backbone.localStorage/js/backbone.localStorage';
import UUID from '../../helpers/UUID';
import locHelp from '../../helpers/location';
import CONFIG from 'config'; // Replaced with alias

const AppModel = Backbone.Model.extend({
  id: 'app',

  defaults: {
    locations: [],
    attrLocks: {},
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
      this.save('appVer', CONFIG.version);
    }
  },

  /**
   * Saves device location.
   *
   * @param location
   */
  setLocation: function (location = {}) {
    var locations = this.get('locations');

    // check if exists
    if (this.locationExists(location)) {
      // don't duplicate same location
      return;
    } else if (!location.latitude || !location.longitude) {
      // don't add if no lat/long
      return;
    }


    // add
    location.id = UUID();
    locations.splice(0, 0, location);

    this.set('locations', locations);
    this.trigger('change:locations');
    this.save();
    return location.id;
  },

  removeLocation: function (location = {}) {
    let that = this;
    var locations = this.get('locations');

    locations.forEach(function (loc, i) {
      if (loc.id === location.id) {
        locations.splice(i, 1);

        that.set('locations', locations);
        that.trigger('change:locations');
        that.save();
      }
    });
  },

  locationExists: function (location = {}) {
    let locations = this.get('locations');
    let exists = false;
    locations.forEach(function (loc) {
      if (
        loc.name === location.name &&
        loc.latitude === location.latitude &&
        loc.longitude === location.longitude &&
        loc.source === location.source
      ) {
        exists = true;
      }
    });
    return exists;
  },

  /**
   * Returns device location as Grid Reference.
   *
   * @param geoloc
   * @returns {*}
   */
  getLocationSref: function (location) {
    var LOCATION_GRANULARITY = 2; // Precision of returned grid reference (6 digits = metres).

    location = location || this.get('locations')[0];
    if (!location) {
      return null;
    }

    // get translated location
    var gref = locHelp.coord2grid(location, LOCATION_GRANULARITY);

    // remove the spaces
    return gref.replace(/ /g, '');
  },

  printLocation: function (location) {
    let useGridRef = this.get('useGridRef');

    if (location.latitude && location.longitude) {
      if (useGridRef || location.source === 'gridref') {
        let accuracy = location.accuracy;

        // cannot be odd
        if (accuracy % 2 != 0) {
          // should not be less than 2
          accuracy = accuracy === 1 ? accuracy + 1 : accuracy - 1;
        } else if (accuracy === 0) {
          accuracy = 2;
        }

        // check if location is within UK
        let prettyLocation = locHelp.coord2grid(location, accuracy);
        if (!prettyLocation) {
          prettyLocation = location.latitude.toFixed(4) + ', ' + location.longitude.toFixed(4);
        }
        return prettyLocation;
      } else {
        return location.latitude.toFixed(4) + ', ' + location.longitude.toFixed(4);
      }
    }
  },

  setAttrLock: function (attr, value) {
    const val = _.cloneDeep(value);
    let locks = this.get('attrLocks');

    locks[attr] = val;
    this.set(locks);
    this.trigger('change:attrLocks');
    this.save();
  },

  getAttrLock: function (attr) {
    let locks = this.get('attrLocks');
    return locks[attr];
  },

  isAttrLocked: function (attr, value = {}) {
    let lockedVal = this.getAttrLock(attr);
    if (!lockedVal) return false; // has not been locked
    if (lockedVal === true) return true; // has been locked

    switch (attr) {
      case 'location':
        let locked =
              // map or gridref
              (lockedVal &&
              (lockedVal.name == value.name &&
              lockedVal.latitude == value.latitude &&
              lockedVal.longitude == value.longitude) ||

                // GPS doesn't lock the location only name
              (lockedVal.name === value.name && (
              !lockedVal.latitude && !lockedVal.longitude)));

        return locked;
        break;
      case 'date':
        lockedVal = new Date(lockedVal);
        if (lockedVal == 'Invalid Date') return false;

        return lockedVal.getTime() === value.getTime();
        break;
      default:
        return value == lockedVal;
    }
  },

  appendAttrLocks: function (sample) {
    var locks = this.get('attrLocks');
    let occurrence = sample.occurrences.at(0);

    _.each(locks, function (value, key) {
      // false or undefined
      if (!value) {
        return;
      }

      const val = _.cloneDeep(value);

      switch (key) {
        case 'location':
          sample.set('location', val);
          break;
        case 'date':
          // parse stringified date
          sample.set('date', new Date(val));
          break;
        case 'number':
          occurrence.set('number', val);
          break;
        case 'stage':
          occurrence.set('stage', val);
          break;
        case 'comment':
          occurrence.set('comment', val);
          break;
        default:
      }
    });
  },
});

const appModel = new AppModel();
export { appModel as default };
