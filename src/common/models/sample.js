/** ****************************************************************************
 * Indicia Sample.
 **************************************************************************** */
import _ from 'lodash';
import Indicia from 'indicia';
import { observable, intercept, toJS } from 'mobx';
import CONFIG from 'config';
import userModel from 'user_model';
import appModel from 'app_model';
import Log from 'helpers/log';
import Device from 'helpers/device';
import complexSurvey from 'common/config/surveys/complex';
import defaultSurvey from 'common/config/surveys/default';
import coreAttributes from 'common/config/surveys';
import taxonGroupSurveys from 'common/config/surveys/taxon-groups';
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
    const { useTraining } = appModel.attrs;
    this.metadata = observable({ training: useTraining, ...this.metadata });
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

    if (this.metadata.saved) {
      return null;
    }

    this.metadata.saved = true;
    await this.save();
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
  async saveRemote() {
    if (this.id || this.metadata.server_on) {
      // an error, this should never happen
      Log('SampleModel: trying to send a record that is already sent!', 'w');
      return Promise.resolve({ data: {} });
    }

    await super.saveRemote();
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

  getSurvey() {
    const getTaxaSpecifigConfig = complex => {
      if (!this.occurrences.length) {
        return Sample.getSurvey(null, complex);
      }

      const [occ] = this.occurrences;

      const taxon = occ.attrs.taxon || {};

      return Sample.getSurvey(taxon.group, complex);
    };

    const complexSurveyName = this.metadata.complex_survey;
    if (!complexSurveyName) {
      if (this.parent) {
        // part of default complex survey
        const taxaSurvey = { ...getTaxaSpecifigConfig() };
        delete taxaSurvey.verify;
        return taxaSurvey;
      }

      return getTaxaSpecifigConfig();
    }

    const isDefault = complexSurveyName === 'default';
    if (isDefault) {
      const survey = Sample.getSurvey(null, complexSurveyName);

      return survey;
      // throw 'TODO: we need to get children sample taxon specific configs as well';
    }

    const survey = Sample.getSurvey(null, complexSurveyName);
    const returnSubSampleSurvey = this.parent;
    if (returnSubSampleSurvey) {
      return survey.smp;
    }

    return survey;
  }

  static getSurvey(taxonGroup, complexSurveyName) {
    if (complexSurveyName) {
      // backwards compatibility
      // TODO: remove in the future
      const complexSurveyConfig =
        complexSurveyName === true
          ? complexSurvey.plant
          : complexSurvey[complexSurveyName];

      return { ...complexSurveyConfig };
    }

    if (!taxonGroup) {
      return { ...defaultSurvey };
    }

    let matchedSurvey = {};
    Object.keys(taxonGroupSurveys).forEach(surveyKey => {
      const survey = taxonGroupSurveys[surveyKey];
      if (survey.taxonGroups.includes(taxonGroup)) {
        matchedSurvey = survey;
      }
    });

    function skipAttributes(__, srcValue) {
      if (_.isObject(srcValue) && srcValue.id) {
        return srcValue;
      }
      return undefined;
    }

    const mergedDefaultSurvey = _.mergeWith(
      {},
      defaultSurvey,
      matchedSurvey,
      skipAttributes
    );

    return mergedDefaultSurvey;
  }

  removeOldTaxonAttributes(occ, taxon) {
    const survey = this.getSurvey();
    const newSurvey = Sample.getSurvey(taxon.group);
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
}

// add geolocation functionality
Sample.prototype = Object.assign(Sample.prototype, GPSExtension);
Sample.prototype.constructor = Sample;

export { Sample as default };
