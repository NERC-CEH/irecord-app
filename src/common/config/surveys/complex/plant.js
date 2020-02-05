/** ****************************************************************************
 * Plant survey configuration file.
 **************************************************************************** */
import DateHelp from 'helpers/date';
import VCs from 'common/data/vice_counties.data';
import userModel from 'user_model';
import appModel from 'app_model';

function verify(attrs, subSample) {
  const attributes = {};

  // location
  const location = attrs.location || {};
  if (!location.latitude) {
    attributes.location = 'missing';
  }
  if (!subSample && !location.name) {
    attributes.name = 'missing';
  }

  // date
  if (!attrs.date) {
    attributes.date = 'missing';
  } else {
    const date = new Date(attrs.date);
    if (date === 'Invalid Date' || date > new Date()) {
      attributes.date = new Date(date) > new Date() ? 'future date' : 'invalid';
    }
  }

  // location type
  if (!attrs.location_type) {
    attributes.location_type = "can't be blank";
  }

  return attributes;
}

const sharedSmpAttrs = {
  date: {
    values(date) {
      return DateHelp.print(date);
    },
    isValid: val => val && val.toString() !== 'Invalid Date',
    type: 'date',
    max: () => new Date(),
  },

  location: {
    id: 'entered_sref',
    required: true,
    label: 'Square',
    values(location, submission) {
      const attributes = {};
      attributes.location_name = location.name; // this is a native indicia attr

      // add other location related attributes
      submission.fields = { ...submission.fields, ...attributes };
      return location.gridref;
    },
  },
  location_accuracy: { id: 282 },
  location_altitude: { id: 283 },
  location_altitude_accuracy: { id: 284 },
  location_source: { id: 760 },
  location_gridref: { id: 335 },
};

const survey = {
  name: 'plant',
  label: 'Plant',
  id: 325,
  complex: true,
  webForm: 'enter-vascular-plants',

  taxonGroups: [89, 78, 87, 99, 81, 148, 133, 129],

  editForm: [
    'smp:location',
    'smp:vice-county',
    'smp:date',
    'smp:recorders',
    'smp:comment',
  ],

  attrs: {
    ...sharedSmpAttrs,

    device: {
      id: 273,
      values: {
        iOS: 2398,
        Android: 2399,
      },
    },

    device_version: { id: 759 },
    app_version: { id: 1139 },

    recorders: {
      id: 1018,
      type: 'inputList',
      placeholder: 'Recorder name',
      icon: 'people',
      info:
        'If anyone helped with documenting the record please enter their name here.',
      values(val, submission) {
        const attributes = {};
        const recorderCount = survey.attrs.recorder_count;

        // add recorder count
        switch (true) {
          case val.length === 1:
            attributes[recorderCount.id] = recorderCount.values['1'];
            break;
          case val.length === 2:
            attributes[recorderCount.id] = recorderCount.values['2'];
            break;
          case val.length <= 5:
            attributes[recorderCount.id] = recorderCount.values['3-5'];
            break;
          case val.length <= 10:
            attributes[recorderCount.id] = recorderCount.values['6-10'];
            break;
          case val.length <= 20:
            attributes[recorderCount.id] = recorderCount.values['11-20'];
            break;
          case val.length >= 21:
            attributes[recorderCount] = recorderCount.values['21+'];
            break;
          default:
            throw new Error('No such recorderCount case found!');
        }
        submission.fields = { ...submission.fields, ...attributes };

        return val;
      },
    },
    recorder_count: {
      id: 992,
      values: {
        1: 7299,
        2: 7300,
        '3-5': 7301,
        '6-10': 7302,
        '21+': 7304,
        '11-20': 7303,
      },
    },
    'vice-county': {
      id: 991,
      type: 'input',
      icon: 'business',
      label: 'Vice County',
      placeholder: 'Vice County name',
      lookup: VCs,
      displayValueParse(val) {
        return val.name;
      },
      values(val, submission) {
        const attributes = {};

        const name = `smpAttr:${this.id}:name`;
        const nameVal = val.name;
        attributes[name] = nameVal;

        submission.fields = { ...submission.fields, ...attributes };

        return parseInt(val.id, 10);
      },
    },
    'time-surveying': {
      id: 993,
      values: {
        '29 mins or less': 7468,
        '30 to 59 mins': 7469,
        '1h - 1h29mins': 7470,
        '1h30mins - 1h59mins': 7471,
        '2h - 2h29mins': 7472,
        '2h30mins -2h59mins': 7473,
        '3h - 3h29mins': 7474,
        '3h30mins - 3h59mins': 7475,
        '4h - 4h29mins': 7476,
        '4h30mins - 4h59mins': 7477,
        '5h - 5h29mins': 7478,
        '5h30mins - 5h59mins': 7479,
        '6h - 6h29mins': 7480,
        '6h30mins - 6h59mins': 7481,
        '7h - 7h29mins': 7482,
        '7h30mins - 7h59mins': 7483,
        '8h - 8h29mins': 7484,
        '8h30mins - 8h59mins': 7485,
        '9h - 9h29mins': 7486,
        '9h30mins - 9h59mins': 7487,
        '10hrs or longer': 7488,
      },
    },

    comment: {
      info:
        "Please include any additional notes about the grid square's environment or your survey methodology. Do not include details about indivual occurences here.",
      icon: 'comment',
      type: 'text',
    },
  },

  smp: {
    editForm: [
      'occ:taxon',
      'smp:location',
      'occ:status',
      'occ:stage',
      'occ:abundance',
      'occ:identifiers',
      'occ:comment',
      'occ:sensitivity_precision',
    ],

    attrs: {
      ...sharedSmpAttrs,

      location: {
        id: 'entered_sref',
        label: 'Location',
        hideName: true,
        required: true,
        values(location, submission) {
          const attributes = {};
          attributes.location_name = location.name; // this is a native indicia attr

          // add other location related attributes
          submission.fields = { ...submission.fields, ...attributes };
          return location.gridref;
        },
      },
    },
    occ: {
      attrs: {
        taxon: {
          id: 'taxa_taxon_list_id',
          type: 'taxon',
          values(taxon) {
            return taxon.warehouse_id;
          },
        },
        abundance: {
          id: 610,
          icon: 'number',
          info: 'Abundance (DAFOR, LA, LF or count).',
          type: 'input',
          validate(value) {
            const re = /^(\d+|[DAFOR]|LA|LF)$/;
            return re.test(value);
          },
        },
        status: {
          id: 507,
          info: 'Please pick the status.',
          default: 'Not Recorded',
          type: 'radio',
          values: {
            Native: 5709,
            Unknown: 5710,
            Introduced: 6775,
            'Introduced - planted': 5711,
            'Introduced - surviving': 10662,
            'Introduced - casual': 10663,
            'Introduced - established': 5712,
            'Introduced - invasive': 5713,
          },
        },
        stage: {
          id: 466,
          info: 'Please pick the life stage.',
          icon: 'stage',
          default: 'Not Recorded',
          type: 'radio',
          values: {
            Flowering: 5331,
            Fruiting: 5330,
            Juvenile: 5328,
            Mature: 5332,
            Seedling: 5327,
            Vegetative: 5329,
          },
        },
        identifiers: {
          id: 125,
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
          type: 'text',
          icon: 'comment',
        },
        sensitivity_precision: {
          metadata: true,
          type: 'toggle',
          icon: 'eyeOff',
          label: 'Sensitive',
        },
      },
      verify(attrs) {
        if (!attrs.taxon) {
          return { taxon: "can't be blank" };
        }
        return null;
      },
    },

    verify: attrs => verify(attrs, true),

    create(Sample, Occurrence, taxon) {
      const { gridSquareUnit, geolocateSurveyEntries } = appModel.attrs;

      const newSubSample = new Sample({
        attrs: {
          location_type: 'british',
        },
        metadata: {
          complex_survey: survey.name,
          gridSquareUnit,
        },
      });

      if (geolocateSurveyEntries) {
        newSubSample.startGPS();
      }

      const occurrence = new Occurrence({ attrs: { taxon } });
      newSubSample.occurrences.push(occurrence);

      const locks = appModel.attrs.attrLocks.complex.plant || {};
      appModel.appendAttrLocks(newSubSample, locks);

      return Promise.resolve(newSubSample);
    },
  },
  verify,

  create(Sample) {
    const { gridSquareUnit } = appModel.attrs;

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
        complex_survey: survey.name,
        gridSquareUnit,
      },
    });

    return Promise.resolve(sample);
  },
};

export default survey;
