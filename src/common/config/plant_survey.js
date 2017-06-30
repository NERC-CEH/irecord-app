import $ from 'jquery';
import viceCounties from 'vice_counties.data';

const config = {
  survey_id: 325,
  input_form: 'enter-vascular-plants',

  informal_groups: [89, 78, 87, 99, 81, 148],

  sample: {
    location: {
      values(location, submission) {
        const attributes = {};
        attributes.location_name = location.name; // this is a native indicia attr

        // add other location related attributes
        $.extend(submission.fields, attributes);
        return location.gridref;
      },
    },
    recorders: {
      id: 1018,
      label: 'If anyone helped with the identification please enter their name here.',
      values(val, submission) {
        const attributes = {};
        const recorderCount = config.sample.recorder_count;

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
        $.extend(submission.fields, attributes);

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
      values(val, submission) {
        const attributes = {};

        const name = `smpAttr:${this.id}:name`;
        const nameVal = val.name;
        attributes[name] = nameVal;

        $.extend(submission.fields, attributes);

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
      label: 'Please include any additional notes about the grid square\'s environment or your survey methodology. Do not include details about indivual occurences here.',
    },
  },

  occurrence: {
    abundance: {
      id: 610,
    },
    status: {
      id: 507,
      label: 'Please pick the status.',
      default: 'Not Recorded',
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
      label: 'Please pick the life stage.',
      default: 'Not Recorded',
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
    },

    comment: {
      label: 'Please add any extra info about this record.',
    },
  },
};

export default config;
