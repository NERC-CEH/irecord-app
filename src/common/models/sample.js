/** ****************************************************************************
 * Indicia Sample.
 *****************************************************************************/
import _ from 'lodash';
import Indicia from 'indicia';
import CONFIG from 'config';
import userModel from 'user_model';
import appModel from 'app_model';
import Occurrence from 'occurrence';
import Log from 'helpers/log';
import Device from 'helpers/device';
import ImageHelp from 'helpers/image';
import store from '../store';
import ImageModel from '../../common/models/image';
import GeolocExtension from './sample_geoloc_ext';

let Sample = Indicia.Sample.extend({ // eslint-disable-line
  api_key: CONFIG.indicia.api_key,
  host_url: CONFIG.indicia.host,
  user: userModel.getUser.bind(userModel),
  password: userModel.getPassword.bind(userModel),

  store, // offline store

  Occurrence,

  keys: CONFIG.indicia.sample, // warehouse attribute keys

  /**
   * Need a function because Device might not be ready on module load.
   * @returns {{device: *, device_version: *}}
   */
  defaults() {
    return {
      // attach device information
      device: Device.getPlatform(),
      device_version: Device.getVersion(),
    };
  },

  initialize() {
    this.checkExpiredGroup(); // activities
    this.listenTo(userModel, 'sync:activities:end', this.checkExpiredGroup);
  },

  validateRemote(attributes) {
    const attrs = _.extend({}, this.attributes, attributes);

    const sample = {};
    const occurrences = {};

    // todo: remove this bit once sample DB update is possible
    // check if saved or already send
    if (!this.metadata.saved || this.getSyncStatus() === Indicia.SYNCED) {
      sample.send = false;
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
        sample.date = (new Date(date) > new Date()) ? 'future date' : 'invalid';
      }
    }

    // location type
    if (!attrs.location_type) {
      sample.location_type = 'can\'t be blank';
    }

    // occurrences
    if (this.occurrences.length === 0) {
      sample.occurrences = 'no species selected';
    } else {
      this.occurrences.each((occurrence) => {
        const errors = occurrence.validate(null, { remote: true });
        if (errors) {
          const occurrenceID = occurrence.cid;
          occurrences[occurrenceID] = errors;
        }
      });
    }

    if (!_.isEmpty(sample) || !_.isEmpty(occurrences)) {
      const errors = {
        sample,
        occurrences,
      };
      return errors;
    }

    return null;
  },

  /**
   * Changes the plain survey key to survey specific metadata
   */
  onSend(submission, media) {
    const survey = CONFIG.indicia.surveys[this.metadata.survey];
    submission.survey_id = survey.survey_id; // eslint-disable-line
    submission.input_form = survey.input_form; // eslint-disable-line

    return Promise.resolve([submission, media]);
  },

  /**
   * Set the sample for submission and send it.
   */
  setToSend() {
    // don't change it's status if already saved
    if (this.metadata.saved) {
      return Promise.resolve(this);
    }

    this.metadata.saved = true;

    if (!this.isValid({ remote: true })) {
      // since the sample was invalid and so was not saved
      // we need to revert it's status
      this.metadata.saved = false;
      return false;
    }

    Log('SampleModel: was set to send.');

    // save sample
    return this.save();
  },

  checkExpiredGroup() {
    const activity = this.get('group');
    if (activity) {
      const expired = userModel.hasActivityExpired(activity);
      if (expired) {
        const newActivity = userModel.getActivity(activity.id);
        if (!newActivity) {
          // the old activity is expired and removed
          Log('Sample:Group: removing exipired activity.');
          this.unset('group');
          this.save();
        } else {
          // old activity has been updated
          Log('Sample:Group: updating exipired activity.');
          this.set('group', newActivity);
          this.save();
        }
      }
    }
  },

  isLocalOnly() {
    const status = this.getSyncStatus();
    return this.metadata.saved &&
      (status === Indicia.LOCAL || status === Indicia.SYNCHRONISING);
  },

  timeout() {
    if (!Device.connectionWifi()) {
      return 180000; // 3 min
    }
    return 60000; // 1 min
  },
});


// add geolocation functionality
Sample = Sample.extend(GeolocExtension);

/**
 * Static helper functions.
 */
const helpers = {

  /**
   * Creates a new sample with an image passed as an argument.
   *
   * Empty taxon.
   */
  createNewSampleWithPhoto(photo) {
    return ImageHelp.getImageModel(ImageModel, photo)
      .then(image => helpers.createNewSample(image));
  },

  /**
   * Creates a new sample with an occurrence.
   * @param image
   * @param taxon
   * @returns {*}
   */
  createNewSample(image, taxon) {
    const occurrence = new Occurrence({ taxon });
    if (image) {
      occurrence.addMedia(image);
    }

    const sample = new Sample(null, {
      metadata: {
        survey: 'general',
      },
    });
    sample.addOccurrence(occurrence);

    // append locked attributes
    appModel.appendAttrLocks(sample);

    // check if location attr is not locked
    const locks = appModel.get('attrLocks');

    if (!locks.location) {
      // no previous location
      sample.startGPS();
    } else if (!locks.location.latitude || !locks.location.longitude) {
      // previously locked location was through GPS
      // so try again
      sample.startGPS();
    }
    return Promise.resolve(sample);
  },
};

_.extend(Sample, helpers);
export { Sample as default };
