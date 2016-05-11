/** ****************************************************************************
 * Morel Sample.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Morel from 'morel';
import CONFIG from 'config'; // Replaced with alias
import recordManager from '../record_manager';
import Occurrence from './occurrence';
import GeolocExtension from './sample_geoloc_ext';

let Sample = Morel.Sample.extend({
  constructor(...args) {
    this.manager = recordManager;
    // Attach the current group/activity name to the sample
    // @todo Check with Karolis, does this cause performance issues, and is
    // it OK to chuck group_title into the sample attributes like this?
    if (arguments.length && arguments[0]['group'] && appModel.get('activities')) {
      let activities = appModel.get('activities'),
          group = arguments[0]['group'],
          group_title = typeof arguments[0]['group_title']!=="undefined" ?
              arguments[0]['group_title'] : 'unknown';
      $.each(activities, function() {
        if (this.id===group) {
          group_title = this.title;
        }
      });
      arguments[0]['group_title'] = group_title;
    }
    Morel.Sample.prototype.constructor.apply(this, args);
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
      callback && callback(); // no error for invalid
      return invalids;
    }

    // save record
    return this.save(null, {
      success: () => {
        callback();
      },
      error: (err) => {
        callback(err);
      },
    });
  },
});

// add geolocation functionality
Sample = Sample.extend(GeolocExtension);

$.extend(true, Morel.Sample.keys, CONFIG.morel.sample);
export { Sample as default };
