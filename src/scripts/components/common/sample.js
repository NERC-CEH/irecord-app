/** ****************************************************************************
 * Morel Sample.
 *****************************************************************************/
import $ from 'jquery';
import Morel from 'morel';
import GPS from '../../helpers/gps';
import LocHelp from '../../helpers/location';
import CONFIG from 'config'; // Replaced with alias
import recordManager from './record_manager';
import Occurrence from './occurrence';
import appModel from './app_model';

$.extend(true, Morel.Sample.keys, CONFIG.morel.sample);

export default Morel.Sample.extend({
  constructor() {
    this.manager = recordManager;
    Morel.Sample.prototype.constructor.apply(this, arguments);
  },

  Occurrence,

  validate(attributes) {
    const attrs = _.extend({}, this.attributes, attributes);

    const sample = {};
    const occurrences = {};

    // todo: remove this bit once sample DB update is possible
    // check if saved
    if (!this.metadata.saved) {
      return true;
    }

    // location
    const location = attrs.location || {};
    if (!location.latitude || !location.longitude) {
      sample.location = 'missing';
    }
    // location name
    if (!location.name) {
      sample['location name'] = 'missing';
    }

    // date
    if (!attrs.date) {
      sample.date = 'missing';
    } else {
      const date = new Date(attrs.date);
      if (date === 'Invalid Date' || date > new Date()) {
        sample.date = (new Date(date) > new Date) ? 'future date' : 'invalid';
      }
    }

    // location type
    if (!attrs.location_type) {
      sample.location_type = 'can\'t be blank';
    }

    // occurrences
    if (this.occurrences.length === 0) {
      sample.occurrences = 'no occurrences';
    } else {
      this.occurrences.each((occurrence) => {
        const errors = occurrence.validate();
        if (errors) {
          const occurrenceID = occurrence.id || occurrence.cid;
          occurrences[occurrenceID] = errors;
        }
      });
    }

    if (! _.isEmpty(sample) || ! _.isEmpty(occurrences)) {
      const errors = {
        sample,
        occurrences,
      };
      return errors;
    }

    return null;
  },

  /**
   * Set the record for submission and send it.
   */
  setToSend(callback) {
    this.metadata.saved = true;

    const invalids = this.validate();
    if (invalids) {
      this.metadata.saved = false;

      callback && callback(invalids);
      return;
    }

    // save record
    this.save(null, {
      success: () => {
        callback();
      },
      error: (err) => {
        callback(err);
      },
    });
  },
});

/**
 *
 * Sample geolocation events:
 * start, update, error, success, stop
 */
const GPSextension = {
  startGPS(accuracyLimit) {
    const that = this;
    const options = {
      accuracyLimit,
      onUpdate(location) {
        that.trigger('geolocation', location);
        that.trigger('geolocation:update', location);
      },

      callback(error, loc) {
        let location = loc;
        GPSextension.stopGPS.call(that, { silent: true });

        if (error) {
          that.trigger('geolocation:error', location);
          return;
        }

        location.source = 'gps';
        location.updateTime = new Date(); // track when gps was acquired
        location.gridref = LocHelp.coord2grid(location, location.accuracy);

        // extend old location to preserve its previous attributes like name or id
        const oldLocation = that.get('location');
        location = $.extend(oldLocation, location);

        that.set('location', location);
        that.save();

        that.trigger('change:location');
        that.trigger('geolocation', location);
        that.trigger('geolocation:success', location);
      },
    };

    this.locating = GPS.start(options);
    that.trigger('geolocation');
    that.trigger('geolocation:start');
  },

  stopGPS(options = {}) {
    GPS.stop(this.locating);
    delete this.locating;

    if (!options.silent) {
      this.trigger('geolocation');
      this.trigger('geolocation:stop');
    }
  },

  isGPSRunning() {
    return this.locating || this.locating === 0;
  },

  /**
   * Print pretty location.
   * @returns {string}
   */
  printLocation() {
    const location = this.get('location') || {};

    return appModel.printLocation(location);
  },
};

$.extend(true, Morel.Sample.prototype, GPSextension);
