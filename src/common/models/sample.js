/** ****************************************************************************
 * Indicia Sample.
 **************************************************************************** */
import _ from 'lodash';
import Indicia from 'indicia';
import bigu from 'bigu';
import CONFIG from 'config';
import userModel from 'user_model';
import appModel from 'app_model';
import Occurrence from 'occurrence';
import Log from 'helpers/log';
import Survey from 'common/config/surveys/Survey';
import Device from 'helpers/device';
import store from '../store';
import GeolocExtension from './sample_geoloc_ext';

let Sample = Indicia.Sample.extend({
  api_key: CONFIG.indicia.api_key,
  host_url: CONFIG.indicia.host,
  user: userModel.getUser.bind(userModel),
  password: userModel.getPassword.bind(userModel),

  store, // offline store

  Occurrence,

  metadata() {
    return {
      training: appModel.get('useTraining'),
    };
  },

  // warehouse attribute keys
  keys() {
    return this.getSurvey().attrs.smp;
  },

  /**
   * Need a function because Device might not be ready on module load.
   * @returns {{device: *, device_version: *}}
   */
  defaults() {
    return {
      // attach device information
      device: Device.getPlatform(),
      device_version: Device.getVersion(),
      location: {},
    };
  },

  initialize() {
    this.checkExpiredGroup(); // activities
    this.listenTo(userModel, 'sync:activities:end', this.checkExpiredGroup);
    this._setGPSlocationSetter();
  },

  validateRemote() {
    const survey = this.getSurvey();
    if (!survey || !survey.verify) {
      Log('Sample:model: no such survey in remote verify.', 'e');
      throw new Error('No sample survey to verify.');
    }

    const verify = survey.verify.bind(this);
    const [attributes, samples, occurrences] = verify(this.attributes);

    if (
      !_.isEmpty(attributes) ||
      !_.isEmpty(samples) ||
      !_.isEmpty(occurrences)
    ) {
      return {
        attributes,
        samples,
        occurrences,
      };
    }

    return null;
  },

  /**
   * Changes the plain survey key to survey specific metadata
   */
  onSend(submission, media) {
    const surveyConfig = this.getSurvey();
    submission.survey_id = surveyConfig.id; // eslint-disable-line
    submission.input_form = surveyConfig.webForm; // eslint-disable-line

    // add the survey_id to subsamples too
    if (this.metadata.complex_survey) {
      submission.samples.forEach(subSample => {
        subSample.survey_id = surveyConfig.id; // eslint-disable-line
        subSample.input_form = surveyConfig.webForm; // eslint-disable-line
      });
    }

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

  _setGPSlocationSetter() {
    if (!this.metadata.complex_survey) {
      return;
    }

    // modify GPS service
    this.setGPSLocation = location => {
      // child samples
      if (this.parent) {
        this.set('location', location);
        return this.save();
      }

      const gridSquareUnit = this.metadata.gridSquareUnit;
      const gridCoords = bigu.latlng_to_grid_coords(
        location.latitude,
        location.longitude
      );

      if (!gridCoords) {
        return null;
      }

      location.source = 'gridref'; // eslint-disable-line
      if (gridSquareUnit === 'monad') {
        // monad
        location.accuracy = 500; // eslint-disable-line

        gridCoords.x += -gridCoords.x % 1000 + 500;
        gridCoords.y += -gridCoords.y % 1000 + 500;
        location.gridref = gridCoords.to_gridref(1000); // eslint-disable-line
      } else {
        // tetrad
        location.accuracy = 1000; // eslint-disable-line

        gridCoords.x += -gridCoords.x % 2000 + 1000;
        gridCoords.y += -gridCoords.y % 2000 + 1000;
        location.gridref = gridCoords.to_gridref(2000); // eslint-disable-line
        location.accuracy = 1000; // eslint-disable-line
      }

      this.set('location', location);
      return this.save();
    };
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
    return (
      this.metadata.saved &&
      (status === Indicia.LOCAL || status === Indicia.SYNCHRONISING)
    );
  },

  timeout() {
    if (!Device.connectionWifi()) {
      return 180000; // 3 min
    }
    return 60000; // 1 min
  },

  setTaxon(taxon = {}) {
    return new Promise((resolve, reject) => {
      if (this.metadata.complex_survey) {
        return reject(
          new Error('Only general survey samples can use setTaxon method')
        );
      }

      const occ = this.getOccurrence();
      if (!occ) {
        return reject(new Error('No occurrence present to set taxon'));
      }

      occ.set('taxon', taxon);
      return resolve(this);
    });
  },

  getSurvey() {
    if (this.metadata.complex_survey) {
      return Survey.factory(null, true);
    }

    const occ = this.getOccurrence();
    if (!occ) {
      throw new Error('No occurrence present to get survey');
    }

    const taxon = occ.get('taxon');
    if (!taxon || !taxon.group) {
      throw new Error('No occurrence taxon group is present to get survey');
    }

    return Survey.factory(taxon.group);
  },
});

// add geolocation functionality
Sample = Sample.extend(GeolocExtension);

export { Sample as default };
