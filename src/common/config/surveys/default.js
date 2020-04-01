/** ****************************************************************************
 * General survey configuration file.
 **************************************************************************** */
import DateHelp from 'helpers/date';
import appModel from 'app_model';
import ImageModel from 'common/models/image';
import ImageHelp from 'helpers/image';
import coreAttributes from './index';

const survey = {
  name: 'default',
  id: 374,
  webForm: 'enter-app-record',

  taxonGroups: [], // all

  render: [
    {
      id: 'occ:number',
      label: 'Abundance',
      icon: 'number',
      group: ['occ:number', 'occ:number-ranges'],
    },

    'occ:stage',
    'occ:sex',
    'occ:identifiers',
  ],

  attrs: {
    location: {
      id: 'entered_sref',
      hideName: true, // general complex survey sub samples use this
      values(location, submission) {
        // convert accuracy for map and gridref sources
        const { accuracy, source, gridref, altitude, name } = location;
        const keys = survey.attrs;

        const locationAttributes = {
          location_name: name, // location_name is a native indicia attr
          [keys.location_source.id]: source,
          [keys.location_gridref.id]: gridref,
          [keys.location_altitude.id]: altitude,
          [keys.location_altitude_accuracy.id]: location.altitudeAccuracy,
          [keys.location_accuracy.id]: accuracy,
        };

        // add other location related attributes
        submission.fields = { ...submission.fields, ...locationAttributes };

        const lat = parseFloat(location.latitude);
        const lon = parseFloat(location.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lat)) {
          return null;
        }

        return `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
      },
    },
    location_accuracy: { id: 282 },
    location_altitude: { id: 283 },
    location_altitude_accuracy: { id: 284 },
    location_source: { id: 760 },
    location_gridref: { id: 335 },

    device: {
      id: 273,
      values: {
        iOS: 2398,
        Android: 2399,
      },
    },

    device_version: { id: 759 },
    app_version: { id: 1139 },

    date: {
      values(date) {
        return DateHelp.print(date);
      },
      isValid: val => val && val.toString() !== 'Invalid Date',
      type: 'date',
      max: () => new Date(),
    },

    activity: {
      id: 'group_id',
      values: activity => activity.id,
      type: 'input',
    },
  },

  verify(attrs) {
    const attributes = {};

    // location
    const location = attrs.location || {};
    if (!location.latitude) {
      attributes.location = 'missing';
    }
    // location name
    if (!location.name) {
      attributes['location name'] = 'missing';
    }

    // date
    if (!attrs.date) {
      attributes.date = 'missing';
    } else {
      const date = new Date(attrs.date);
      if (date === 'Invalid Date' || date > new Date()) {
        attributes.date =
          new Date(date) > new Date() ? 'future date' : 'invalid';
      }
    }

    return attributes;
  },

  occ: {
    attrs: {
      training: {
        id: 'training',
      },
      taxon: {
        id: 'taxa_taxon_list_id',
        type: 'taxon',
        values(taxon) {
          return taxon.warehouse_id;
        },
      },
      number: {
        id: 16,
        info: 'How many individuals of this type?',
        label: 'Abundance',
        icon: 'number',
        type: 'slider',
        incrementShortcut: true,
      },
      'number-ranges': {
        id: 523,
        default: 'Present',
        type: 'radio',
        values: {
          1: 665,
          '2-5': 666,
          '6-20': 667,
          '21-100': 668,
          '101-500': 669,
          '500+': 670,
        },
      },
      stage: {
        id: 106,
        info: 'Please pick the life stage.',
        default: 'Not Recorded',
        values: {
          Adult: 1950,
          'Pre-adult': 1951,
          Other: 1952,
        },
        icon: 'stage',
        type: 'radio',
      },
      sex: {
        id: 105,
        info: 'Please indicate the sex of the organism.',
        default: 'Not Recorded',
        values: {
          Male: 1947,
          Female: 1948,
          Mixed: 3482,
        },
        icon: 'gender',
        type: 'radio',
      },
      identifiers: {
        id: 18,
        info:
          'If anyone helped with the identification please enter their name here.',
        icon: 'user-plus',
        placeholder: 'Name',
        type: 'inputList',
        values(val) {
          if (typeof val === 'string') {
            // backwards compatibility
            return val;
          }

          return val.join(', ');
        },
      },
      comment: {
        info: 'Please add any extra info about this record.',
        icon: 'comment',
        type: 'text',
      },
    },
    verify(attrs) {
      if (!attrs.taxon) {
        return { taxon: "can't be blank" };
      }
      return null;
    },
  },

  create(Sample, Occurrence, image, taxon, skipLocation, skipGPS) {
    // default survey
    const occurrence = new Occurrence({ attrs: { taxon } });
    if (image) {
      occurrence.media.push(image);
    }

    const sample = new Sample();
    sample.occurrences.push(occurrence);

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
      appModel.appendAttrLocks(sample, coreLocks);
      sample.startGPS();
      return Promise.resolve(sample);
    }

    const surveyConfig = sample.getSurvey();
    const surveyName = surveyConfig.name;
    const surveyLocks = defaultSurveyLocks[surveyName];
    const fullSurveyLocks = { ...coreLocks, ...surveyLocks };
    appModel.appendAttrLocks(sample, fullSurveyLocks, skipLocation);

    const isLocationLocked = appModel.getAttrLock('smp', 'location');
    if (!isLocationLocked && !skipGPS) {
      sample.startGPS();
    }

    return Promise.resolve(sample);
  },

  async createWithPhoto(Sample, Occurrence, photo) {
    const image = await ImageHelp.getImageModel(ImageModel, photo);
    return survey.create(Sample, Occurrence, image);
  },
};

export default survey;
