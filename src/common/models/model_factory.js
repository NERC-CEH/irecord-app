import _ from 'lodash';
import ImageHelp from 'helpers/image';
import userModel from 'user_model';
import appModel from 'app_model';
import Log from 'helpers/log';
import complexSurveysConfig from 'common/config/surveys/complex';
import { coreAttributes } from 'common/config/surveys/default';
import ImageModel from './image';
import Sample from './sample';
import Occurrence from './occurrence';

const Factory = {
  async createSample({ complex, survey, image, taxon }) {
    if (complex) {
      if (survey === 'plant') {
        return Factory._getComplexPlantSample();
      }
      if (survey === 'moth') {
        return Factory._getComplexMothSample();
      }

      return Factory._getComplexDefaultSample();
    }

    const sample = await Factory._getDefaultSample(image, taxon);

    // check if location attr is not locked
    if (!appModel.getAttrLock('smp', 'location')) {
      // no previous location
      sample.startGPS();
    }

    return sample;
  },

  createPlantSubSample({ taxon }) {
    const { gridSquareUnit, geolocateSurveyEntries } = appModel.attrs;

    const newSubSample = new Sample({
      attrs: {
        location_type: 'british',
      },
      metadata: {
        complex_survey: complexSurveysConfig.plant.name,
        gridSquareUnit,
      },
    });

    if (geolocateSurveyEntries) {
      newSubSample.startGPS();
    }

    const occurrence = new Occurrence({ attrs: { taxon } });
    newSubSample.occurrences.push(occurrence);

    const locks = appModel.attrs.attrLocks.complex.plant || {};
    Factory._appendAttrLocks(newSubSample, locks);

    return Promise.resolve(newSubSample);
  },

  createMothOccurrence({ taxon }) {
    const newOccurrene = new Occurrence({ attrs: { taxon, number: 1 } });

    const locks = appModel.attrs.attrLocks.complex.moth || {};
    this._appendAttrLocks(newOccurrene, locks);
    return newOccurrene;
  },

  async createComplexDefaultSubSample(surveySample, { taxon }) {
    const sample = await Factory._getDefaultSample(null, taxon, true);

    const survey = sample.getSurvey();
    if (survey.occ.attrs.number && survey.occ.attrs.number.incrementShortcut) {
      sample.occurrences[0].attrs.number = 1;
    }

    // set sample location to survey's location which
    // can be corrected by GPS or user later on
    // TODO: listen for surveySample attribute changes
    const surveyLocationIsSet = !!surveySample.attrs.location.latitude;
    if (surveyLocationIsSet) {
      const surveyLocation = JSON.parse(
        JSON.stringify(surveySample.attrs.location)
      );
      delete surveyLocation.name;

      sample.attrs.location = surveyLocation;
    }

    if (appModel.attrs.geolocateSurveyEntries) {
      sample.startGPS();
    }

    return sample;
  },

  _getComplexPlantSample() {
    const { gridSquareUnit, useTraining } = appModel.attrs;

    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.hasLogIn()) {
      recorders.push(
        `${userModel.attrs.firstname} ${userModel.attrs.secondname}`
      );
    }

    const sample = new Sample({
      attrs: {
        location_type: 'british',
        sample_method_id: 7305,
        recorders,
      },
      metadata: {
        complex_survey: complexSurveysConfig.plant.name,
        training: useTraining,
        gridSquareUnit,
      },
    });

    return Promise.resolve(sample);
  },

  _getComplexDefaultSample() {
    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.hasLogIn()) {
      recorders.push(
        `${userModel.attrs.firstname} ${userModel.attrs.secondname}`
      );
    }

    const sample = new Sample({
      attrs: {
        location_type: 'british',
        recorders,
      },
      metadata: {
        complex_survey: complexSurveysConfig.default.name,
      },
    });

    sample.startGPS();

    return Promise.resolve(sample);
  },

  _getComplexMothSample() {
    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.hasLogIn()) {
      recorders.push(
        `${userModel.attrs.firstname} ${userModel.attrs.secondname}`
      );
    }

    const sample = new Sample({
      attrs: {
        location_type: 'british',
        recorders,
      },
      metadata: {
        complex_survey: complexSurveysConfig.moth.name,
      },
    });

    sample.startGPS();

    return Promise.resolve(sample);
  },

  _getDefaultSample(image, taxon, skipLocation) {
    // default survey
    const occurrence = new Occurrence();
    if (image) {
      occurrence.media.push(image);
    }

    const sample = new Sample({
      metadata: {
        training: appModel.attrs.useTraining,
      },
    });

    sample.occurrences.push(occurrence);

    taxon && sample.setTaxon(taxon);

    // append locked attributes
    const defaultSurveyLocks = appModel.attrs.attrLocks.default || {};
    const locks = defaultSurveyLocks.default || {};
    const coreLocks = Object.keys(locks).reduce((agg, key) => {
      if (coreAttributes.includes(key)) {
        agg[key] = locks[key];
      }
      return agg;
    }, {});

    if (!taxon) {
      // when there is no taxon we don't know the survey yet
      // these are core attributes and safe to reuse in any survey
      Factory._appendAttrLocks(sample, coreLocks);
      return Promise.resolve(sample);
    }

    const surveyConfig = sample.getSurvey();
    const surveyName = surveyConfig.name;
    const surveyLocks = {
      ...{},
      ...coreLocks,
      ...defaultSurveyLocks[surveyName],
    };
    Factory._appendAttrLocks(sample, surveyLocks, skipLocation);

    return Promise.resolve(sample);
  },

  _appendAttrLocks(model, locks = {}, skipLocation) {
    Log('modelFactory: appending attr locks.');

    const isOccurrenceOnly = model instanceof Occurrence;

    function selectModel(attrType) {
      const isSampleAttr = attrType === 'smp';
      if (isSampleAttr && isOccurrenceOnly) {
        throw new Error('Invalid attibute lock configuration');
      }

      if (isSampleAttr) {
        return model;
      }

      return isOccurrenceOnly ? model : model.occurrences[0];
    }

    Object.keys(locks).forEach(attr => {
      const value = locks[attr];
      // false or undefined or temp 'true' flag
      if (!value || value === true) {
        return;
      }

      const attrParts = attr.split(':');
      const attrType = attrParts[0];
      const attrName = attrParts[1];

      const selectedModel = selectModel(attrType);

      const val = _.cloneDeep(value);
      switch (attr) {
        case 'smp:activity':
          if (!userModel.hasActivityExpired(val)) {
            Log('SampleModel:AttrLocks: appending activity to the sample.');
            model.attrs.activity = val;
          } else {
            // unset the activity as it's now expired
            Log('SampleModel:AttrLocks: activity has expired.');
            appModel.unsetAttrLock('smp', 'activity');
          }
          break;
        case 'smp:location':
          if (skipLocation) {
            break;
          }
          let { location } = selectedModel.attrs;
          val.name = location.name; // don't overwrite old name
          selectedModel.attrs.location = val;
          break;
        case 'smp:locationName':
          if (skipLocation) {
            break;
          }
          location = selectedModel.attrs.location;
          location.name = val;
          selectedModel.attrs.location = location;
          break;
        case 'smp:date':
          // parse stringified date
          selectedModel.attrs.date = new Date(val);
          break;
        case 'occ:number':
          const isValidNumber = !Number.isNaN(Number(val));
          const numberAttrName = isValidNumber ? 'number' : 'number-ranges';
          selectedModel.attrs[numberAttrName] = val;
          break;
        default:
          selectedModel.attrs[attrName] = val;
      }
    });
  },

  /**
   * Creates a new sample with an image passed as an argument.
   *
   * Empty taxon.
   */
  createSampleWithPhoto(photo) {
    return ImageHelp.getImageModel(ImageModel, photo).then(image =>
      Factory.createSample({ image })
    );
  },
};

export default Factory;
