/** ****************************************************************************
 * Indicia Sample.
 **************************************************************************** */
import _ from 'lodash';
import Indicia from 'indicia';
import { observable, intercept, toJS } from 'mobx';
import CONFIG from 'config';
import userModel from 'user_model';
import Log from 'helpers/log';
import getSurvey from 'common/config/surveys/utils';
import { coreAttributes } from 'common/config/surveys/default';
import Device from 'helpers/device';
import Occurrence from './occurrence';
import Media from './image';
import { modelStore } from '../store';
import GPSExtension from './sample_gps_ext';

class Sample extends Indicia.Sample {
  static fromJSON(json) {
    return super.fromJSON(json, Occurrence, Sample, Media);
  }

  store = modelStore;

  constructor(...args) {
    super(...args);

    this.attrs = observable({
      ...{
        date: new Date(),
        location_type: 'latlon',
        location: {
          accuracy: null,
          altitude: null,
          gridref: null,
          latitude: null,
          longitude: null,
          name: null,
          source: null,
        },
      },
      ...this.attrs,
    });
    this.error = observable({ message: null });
    this.remote = observable({
      api_key: CONFIG.indicia.api_key,
      host_url: CONFIG.indicia.host,
      user: userModel.getUser.bind(userModel),
      password: userModel.getPassword.bind(userModel),
      synchronising: false,
    });
    this.metadata = observable(this.metadata);
    this.samples = observable(this.samples);
    this.occurrences = observable(this.occurrences);
    this.media = observable(this.media);

    const onAddedSetParent = change => {
      if (change.added && change.added.length) {
        const model = change.added[0];
        model.parent = this;
      }

      return change;
    };
    intercept(this.samples, onAddedSetParent);
    intercept(this.occurrences, onAddedSetParent);
    intercept(this.media, onAddedSetParent);

    // TODO:
    // this.checkExpiredActivity(); // activities
    // this.listenTo(userModel, 'sync:activities:end', this.checkExpiredActivity);
    this.gpsExtensionInit();
  }

  // warehouse attribute keys
  keys = () => {
    return { ...Indicia.Sample.keys, ...this.getSurvey().attrs };
  };

  validateRemote() {
    const survey = this.getSurvey();
    const invalidAttributes = survey.verify && survey.verify(this.attrs);
    const attributes = { ...invalidAttributes };

    const alreadySynced = !this.parent && this.metadata.synced_on;
    if (alreadySynced) {
      // TODO: remove this bit once sample DB update is possible
      // check if saved or already send
      attributes.send = false;
    }

    const validateSubModel = (agg, model) => {
      const invalids = model.validateRemote();
      if (invalids) {
        agg[model.cid] = invalids;
      }
      return agg;
    };

    const samples = this.samples.reduce(validateSubModel, {});
    const occurrences = this.occurrences.reduce(validateSubModel, {});
    const media = this.media.reduce(validateSubModel, {});

    if (
      !_.isEmpty(attributes) ||
      !_.isEmpty(samples) ||
      !_.isEmpty(occurrences) ||
      !_.isEmpty(media)
    ) {
      return { attributes, samples, occurrences, media };
    }

    return null;
  }

  toJSON() {
    return toJS(super.toJSON(), { recurseEverything: true });
  }

  _attachTopSampleSubmission(updatedSubmission) {
    const isTopSample = !this.parent;
    if (!isTopSample) {
      return;
    }

    const keys = this.keys();

    const appAndDeviceFields = {
      [keys.device.id]: keys.device.values[Device.getPlatform()],
      [keys.device_version.id]: Device.getVersion(),
      [keys.app_version.id]: `${CONFIG.version}.${CONFIG.build}`,
    };
    updatedSubmission.fields = {
      ...updatedSubmission.fields,
      ...appAndDeviceFields,
    };
  }

  _attachSubSampleSubmission(updatedSubmission) {
    const isTopSample = !this.parent;
    if (isTopSample) {
      return;
    }

    const keys = this.keys();

    const parentSurvey = this.parent.getSurvey();
    updatedSubmission.survey_id = parentSurvey.id;

    const parentAttrs = this.parent.attrs;

    const location = updatedSubmission.fields[keys.location.id];
    if (!location) {
      const parentLocation = keys.location.values(
        parentAttrs.location,
        updatedSubmission
      );
      updatedSubmission.fields[keys.location.id] = parentLocation;

      let locationType = keys.location_type.values[parentAttrs.location_type];
      if (locationType === 'OSGB') {
        locationType = 4326; // TODO: backwards comp, remove when v5 Beta testing finished
      }

      updatedSubmission.fields[keys.location_type.id] = locationType;
    }
  }

  // eslint-disable-next-line
  _attachOnSendSubmission(surveyConfig, updatedSubmission) {
    const hasSurveySpecificSubmission = surveyConfig.onSend;
    if (hasSurveySpecificSubmission) {
      updatedSubmission.fields = {
        ...updatedSubmission.fields,
        ...surveyConfig.onSend(),
      };
    }
  }

  getSubmission(...args) {
    const [submission, media] = super.getSubmission(...args);
    const surveyConfig = this.getSurvey();

    const newAttrs = {
      survey_id: surveyConfig.id,
      input_form: surveyConfig.webForm,
    };
    const updatedSubmission = { ...submission, ...newAttrs };

    this._attachTopSampleSubmission(updatedSubmission);
    this._attachSubSampleSubmission(updatedSubmission);
    this._attachOnSendSubmission(surveyConfig, updatedSubmission);

    return [updatedSubmission, media];
  }

  async setToSend() {
    // TODO: remove this once clear why the resubmission occurs
    // https://www.brc.ac.uk/irecord/node/7194
    if (this.id || this.metadata.server_on) {
      // an error, this should never happen
      Log(
        'SampleModel: trying to set a record for submission that is already sent!',
        'e'
      );
    }

    const invalids = this.validateRemote();
    if (invalids) {
      return invalids;
    }

    if (!this.metadata.saved) {
      this.metadata.saved = true;
      await this.save();
    }

    return null;
  }

  async save() {
    if (this.parent) {
      return this.parent.save();
    }

    if (!this.store) {
      return Promise.reject(
        new Error('Trying to sync locally without a store')
      );
    }

    await this.store.save(this.cid, this.toJSON());
    return this;
  }

  async destroy(silent) {
    const destroySubModels = () =>
      Promise.all([
        Promise.all(this.media.map(media => media.destroy(true))),
        Promise.all(this.occurrences.map(occ => occ.destroy(true))),
      ]);

    if (this.parent) {
      this.parent.samples.remove(this);

      await destroySubModels();

      if (silent) {
        return null;
      }

      return this.parent.save();
    }

    if (!this.store) {
      return Promise.reject(
        new Error('Trying to sync locally without a store')
      );
    }

    await this.store.destroy(this.cid);

    if (this.collection) {
      this.collection.remove(this);
    }

    await destroySubModels();

    return this;
  }

  // TODO: remove this once clear why the resubmission occurs
  // https://www.brc.ac.uk/irecord/node/7194
  async saveRemote(...args) {
    const { remote } = args[2] || {};

    if (remote && (this.id || this.metadata.server_on)) {
      // an error, this should never happen
      Log('SampleModel: trying to send a record that is already sent!', 'w');
      return Promise.resolve({ data: {} });
    }
    await super.saveRemote(...args);
    return this.save();
  }

  checkExpiredActivity() {
    const { activity } = this.attrs;
    if (activity) {
      const expired = userModel.hasActivityExpired(activity);
      if (expired) {
        const newActivity = userModel.getActivity(activity.id);
        if (!newActivity) {
          // the old activity is expired and removed
          Log('Sample:Activity: removing exipired activity.');
          this.attrs.activity = null;
          this.save();
        } else {
          // old activity has been updated
          Log('Sample:Activity: updating exipired activity.');
          this.attrs.activity = newActivity;
          this.save();
        }
      }
    }
  }

  setTaxon(taxon = {}) {
    return new Promise((resolve, reject) => {
      if (!taxon.group) {
        return reject(new Error('New taxon must have a group'));
      }

      if (this.metadata.complex_survey) {
        return reject(
          new Error('Only default survey samples can use setTaxon method')
        );
      }

      const occ = this.occurrences[0];
      if (!occ) {
        return reject(new Error('No occurrence present to set taxon'));
      }

      if (occ.attrs.taxon) {
        const survey = this.getSurvey();
        const newSurvey = getSurvey(taxon.group);
        if (survey.name !== newSurvey.name) {
          // remove non-core attributes for survey switch
          Object.keys(this.attrs).forEach(key => {
            if (!coreAttributes.includes(`smp:${key}`)) {
              delete this.attrs[key];
            }
          });
          Object.keys(occ.attrs).forEach(key => {
            if (!coreAttributes.includes(`occ:${key}`)) {
              delete occ.attrs[key];
            }
          });
        }
      }

      occ.attrs.taxon = taxon;
      return resolve(this);
    });
  }

  getSurvey() {
    const getTaxaSpecifigConfig = complex => {
      if (!this.occurrences.length) {
        return getSurvey(null, complex);
      }

      const [occ] = this.occurrences;

      const taxon = occ.attrs.taxon || {};

      return getSurvey(taxon.group, complex);
    };

    const complexSurvey = this.metadata.complex_survey;
    if (!complexSurvey) {
      if (this.parent) {
        // part of default complex survey
        const taxaSurvey = { ...getTaxaSpecifigConfig() };
        delete taxaSurvey.verify;
        return taxaSurvey;
      }

      return getTaxaSpecifigConfig();
    }

    const isDefault = complexSurvey === 'default';
    if (isDefault) {
      const survey = getSurvey(null, complexSurvey);

      return survey;
      // throw 'TODO: we need to get children sample taxon specific configs as well';
    }

    const survey = getSurvey(null, complexSurvey);
    const returnSubSampleSurvey = this.parent;
    if (returnSubSampleSurvey) {
      return survey.smp;
    }

    return survey;
  }
}

// add geolocation functionality
Sample.prototype = Object.assign(Sample.prototype, GPSExtension);
Sample.prototype.constructor = Sample;

export { Sample as default };
