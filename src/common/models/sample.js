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
import { coreAttributes } from 'common/config/surveys/general';
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
      location: {},
    };
  },

  initialize() {
    this.checkExpiredActivity(); // activities
    this.listenTo(userModel, 'sync:activities:end', this.checkExpiredActivity);
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
    const newAttrs = {
      survey_id: surveyConfig.id,
      input_form: surveyConfig.webForm,
    };

    const smpAttrs = surveyConfig.attrs.smp;
    const updatedSubmission = Object.assign({}, submission, newAttrs);
    updatedSubmission.fields = Object.assign({}, updatedSubmission.fields, {
      [smpAttrs.device.id]: smpAttrs.device.values[Device.getPlatform()],
      [smpAttrs.device_version.id]: Device.getVersion(),
      [smpAttrs.app_version.id]: `${CONFIG.version}.${CONFIG.build}`,
    });

    // add the survey_id to subsamples too
    if (this.metadata.complex_survey) {
      updatedSubmission.samples.forEach(subSample => {
        subSample.survey_id = surveyConfig.id; // eslint-disable-line
        subSample.input_form = surveyConfig.webForm; // eslint-disable-line
      });
    }

    return Promise.resolve([updatedSubmission, media]);
  },

  /**
   * Set the sample for submission and send it.
   */
  setToSend() {
    // don't change it's status if already saved
    if (this.metadata.saved) {
      return Promise.resolve(this);
    }

    // TODO: remove this once clear why the resubmission occurs
    // https://www.brc.ac.uk/irecord/node/7194
    if (this.id || this.metadata.server_on) {
      // an error, this should never happen
      Log(
        'SampleModel: trying to set a record for submission that is already sent!',
        'w'
      );
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

  // TODO: remove this once clear why the resubmission occurs
  // https://www.brc.ac.uk/irecord/node/7194
  _syncRemote(...args) {
    const { remote } = args[2] || {};

    if (remote && (this.id || this.metadata.server_on)) {
      // an error, this should never happen
      Log('SampleModel: trying to send a record that is already sent!', 'w');
      return Promise.resolve({ data: {} });
    }

    return Indicia.Sample.prototype._syncRemote.apply(this, args);
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

  checkExpiredActivity() {
    const activity = this.get('activity');
    if (activity) {
      const expired = userModel.hasActivityExpired(activity);
      if (expired) {
        const newActivity = userModel.getActivity(activity.id);
        if (!newActivity) {
          // the old activity is expired and removed
          Log('Sample:Activity: removing exipired activity.');
          this.unset('activity');
          this.save();
        } else {
          // old activity has been updated
          Log('Sample:Activity: updating exipired activity.');
          this.set('activity', newActivity);
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
      if (!taxon.group) {
        return reject(new Error('New taxon must have a group'));
      }

      if (this.metadata.complex_survey) {
        return reject(
          new Error('Only general survey samples can use setTaxon method')
        );
      }

      const occ = this.getOccurrence();
      if (!occ) {
        return reject(new Error('No occurrence present to set taxon'));
      }

      if (occ.get('taxon')) {
        const survey = this.getSurvey();
        const newSurvey = Survey.factory(taxon.group);
        if (survey.name !== newSurvey.name) {
          // remove non-core attributes for survey switch
          Object.keys(this.attributes).forEach(key => {
            if (!coreAttributes.includes(`smp:${key}`)) {
              this.unset(key);
            }
          });
          Object.keys(occ.attributes).forEach(key => {
            if (!coreAttributes.includes(`occ:${key}`)) {
              occ.unset(key);
            }
          });
        }
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
