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
  id: 490,
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
    'occ:type',
    'occ:identifiers',
    'occ:sensitivity_precision',
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
        id: 93,
        info: 'How many individuals of this type?',
        label: 'Abundance',
        icon: 'number',
        type: 'slider',
      },
      stage: {
        id: 218,
        info:
          'Please indicate the life stage and sex of the organism, if recorded.',
        default: 'Not Recorded',
        values: {
          Male: 3484,
          'Pre-adult': 1951,
          Female: 3483,
          Other: 1952,
          Adult: 3405,
          'Adult male': 3406,
          'Adult female': 3407,
          Juvenile: 3408,
          'Juvenile male': 3409,
          'Juvenile female': 3410,
          'Breeding pair': 3411,
          'Mixed group': 5261,
          'In flower': 3412,
          Fruiting: 3413,
          Egg: 3956,
          Larva: 3957,
          Nymph: 3959,
          Spawn: 3960,
          Pupa: 3958,
          'Other (please add to comments)': 3414,
          'Not recorded': 3415,
        },
        icon: 'stage',
        type: 'radio',
      },
      type: {
        id: 217,
        info: 'Select the type of observation that was made.',
        default: 'Not Recorded',
        values: {
          Seen: 3383,
          Heard: 3384,
          Dead: 3385,
          'Dead on road': 3386,
          'Feeding remains': 3387,
          'Dung or droppings': 3388,
          'Tracks or trail': 3389,
          Burrow: 3391,
          Nest: 3392,
          Colony: 5667,
          'Bat Roost': 3924,
          'Bat Hibernacula': 5294,
          'Bat Breeding Roost': 5296,
          'Bat Detected': 5299,
          'Bat Grounded': 7799,
          'Bat Seen': 5734,
          Trap: 5881,
          'Light trap': 3390,
          'Net trap': 5869,
          'Camera trap': 5870,
          'Other (please add to comments)': 3393,
        },
        icon: 'type',
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
      sensitivity_precision: {
        label: 'Sensitivity',
        placeholder: 'Not sensitive',
        info:
          'This is the precision that the record will be shown at for public viewing.',
        default: 'Not Sensitive',
        values: {
          'Blur to 1km': 1000,
          'Blur to 2km': 2000,
          'Blur to 10km': 10000,
          'Blur to 100km': 100000,
        },
        icon: 'disc',
        type: 'radio',
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
