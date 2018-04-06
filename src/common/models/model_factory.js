import _ from 'lodash';
import ImageHelp from 'helpers/image';
import userModel from 'user_model';
import appModel from 'app_model';
import Log from 'helpers/log';
import { coreAttributes } from 'common/config/surveys/general';
import ImageModel from './image';
import Sample from './sample';
import Occurrence from './occurrence';

const Factory = {
  createSample(survey, image, taxon) {
    if (!survey) {
      return Promise.reject(new Error('Survey options are missing.'));
    }

    // plant survey
    if (survey === 'plant') {
      return Factory._getPlantSample(image, taxon);
    }

    return Factory._getGeneralSample(image, taxon);
  },

  _getPlantSample(image, taxon) {
    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.hasLogIn()) {
      recorders.push(
        `${userModel.get('firstname')} ${userModel.get('secondname')}`
      );
    }

    const sample = new Sample(
      {
        location_type: 'british',
        sample_method_id: 7305,
        recorders,
      },
      {
        metadata: {
          complex_survey: true,
          gridSquareUnit: appModel.get('gridSquareUnit'),
        },
      }
    );

    // occurrence with image - pic select-first only
    if (image) {
      const occurrence = new Occurrence({ taxon });
      occurrence.addMedia(image);
      sample.addOccurrence(occurrence);
    }

    return Promise.resolve(sample);
  },

  _getGeneralSample(image, taxon) {
    // general survey
    const occurrence = new Occurrence();
    if (image) {
      occurrence.addMedia(image);
    }

    const sample = new Sample();
    sample.addOccurrence(occurrence);

    // check if location attr is not locked
    if (!appModel.getAttrLock('smp:location')) {
      // no previous location
      sample.startGPS();
    }

    taxon && sample.setTaxon(taxon);

    // append locked attributes
    const locks = appModel.get('attrLocks');
    const defaultSurveyLocks = locks.general.default || {};
    const coreLocks = {};
    Object.keys(defaultSurveyLocks)
      .filter(key => coreAttributes.includes(key))
      .forEach(key => {
        coreLocks[key] = defaultSurveyLocks[key];
      });
    if (!taxon) {
      // when there is no taxon we don't know the survey yet
      // these are core attributes and safe to reuse in any survey
      Factory._appendAttrLocks(sample, coreLocks);
      return Promise.resolve(sample);
    }

    const surveyConfig = sample.getSurvey();
    const surveyName = surveyConfig.name;
    const surveyLocks = Object.assign({}, coreLocks, locks.general[surveyName]);
    Factory._appendAttrLocks(sample, surveyLocks);

    return Promise.resolve(sample);
  },

  _appendAttrLocks(sample, locks = {}) {
    Log('modelFactory: appending attr locks.');

    Object.keys(locks).forEach(attr => {
      const value = locks[attr];
      // false or undefined
      if (!value) {
        return;
      }

      const val = _.cloneDeep(value);
      let occurrence;
      switch (attr) {
        case 'smp:activity':
          if (!userModel.hasActivityExpired(val)) {
            Log('SampleModel:AttrLocks: appending activity to the sample.');
            sample.set('activity', val);
          } else {
            // unset the activity as it's now expired
            Log('SampleModel:AttrLocks: activity has expired.');
            appModel.unsetAttrLock('activity');
          }
          break;
        case 'smp:location':
          let location = sample.get('location');
          val.name = location.name; // don't overwrite old name
          sample.set('location', val);
          break;
        case 'smp:locationName':
          // insert location name
          location = sample.get('location');
          location.name = val;
          sample.set('location', location);
          break;
        case 'smp:date':
          // parse stringified date
          sample.set('date', new Date(val));
          break;
        case 'occ:number':
          occurrence = sample.getOccurrence();
          const numberAttrName = !Number.isNaN(Number(val))
            ? 'number'
            : 'number-ranges';
          occurrence.set(numberAttrName, val);
          break;
        case 'occ:stage':
          occurrence = sample.getOccurrence();
          occurrence.set('stage', val);
          break;
        default:
          const attrParts = attr.split(':');
          const attrType = attrParts[0];
          const attrName = attrParts[1];
          const model = attrType === 'smp' ? sample : sample.getOccurrence();
          model.set(attrName, val);
      }
    });
  },

  /**
   * Creates a new sample with an image passed as an argument.
   *
   * Empty taxon.
   */
  createSampleWithPhoto(survey, photo) {
    return ImageHelp.getImageModel(ImageModel, photo).then(image =>
      Factory.createSample(survey, image)
    );
  },
};

export default Factory;
