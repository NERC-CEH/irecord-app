/** ****************************************************************************
 * Plant survey configuration file.
 **************************************************************************** */
import DateHelp from 'helpers/date';
import userModel from 'user_model';

const sex = {
  Male: 1947,
  Female: 1948,
  Mixed: 3482,
};

const stage = {
  Adult: 2189,
  Larva: 2190,
  'Larval web': 2191,
  'Larval case': 2192,
  Mine: 2193,
  Egg: 2194,
  'Egg batch': 2195,
  'Not recorded': 10647,
};

const survey = {
  name: 'moth',
  label: 'Moth',
  id: 90,
  complex: true,

  webForm: 'enter-moth-sightings',

  editForm: [
    'smp:location',
    'smp:date',
    'smp:recorders',
    'smp:method',
    'smp:comment',
  ],

  attrs: {
    location: {
      id: 'entered_sref',
      icon: 'pin',
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
      icon: 'calendar',
      max: () => new Date(),
    },

    recorders: {
      id: 127,
      type: 'inputList',
      required: true,
      placeholder: 'Recorder name',
      info:
        'If anyone helped with documenting the record please enter their name here.',
      icon: 'people',
      values(val) {
        return val.join(', ');
      },
    },

    method: {
      id: 263,
      type: 'radio',
      label: 'Method',
      info:
        'Please enter your sampling method (i.e. type of trap or recording method).',
      default: 'Not Recorded',
      values: {
        'MV Light': 2196,
        'Actinic Light': 2197,
        'Light Trapping': 2198,
        'Daytime observation': 2199,
        Dusking: 2200,
        'Attracted to a lighted window': 2201,
        Sugaring: 2202,
        'Wine Roping': 2203,
        'Beating tray': 2204,
        'Pheromone trap': 2205,
        'Other method (add comment)': 2206,
      },
    },

    comment: {
      info: 'Please add any extra info about this list.',
      icon: 'comment',
      type: 'text',
    },
  },
  occ: {
    editForm: [
      'occ:taxon',
      'occ:number',
      'occ:stage',
      'occ:sex',
      'occ:identifiers',
      'occ:comment',
    ],

    attrs: {
      taxon: {
        id: 'taxa_taxon_list_id',
        type: 'taxon',
        values(taxon) {
          return taxon.warehouse_id;
        },
      },
      number: {
        id: 133,
        label: 'Quantity',
        icon: 'number',
        type: 'slider',
        info: 'How many individuals of this type?',
      },
      stage: {
        type: 'radio',
        id: 130,
        label: 'Stage',
        icon: 'stage',
        required: true,
        info: 'Please indicate the stage of the organism.',
        default: 'Not Recorded',
        values: stage,
      },
      sex: {
        type: 'radio',
        id: 105,
        label: 'Sex',
        icon: 'gender',
        info: 'Please indicate the sex of the organism.',
        default: 'Not Recorded',
        values: sex,
      },
      identifiers: {
        id: 18,
        placeholder: 'Name',
        icon: 'user-plus',
        type: 'inputList',
        info:
          'If anyone helped with the identification please enter their name here.',
        values(val) {
          return val.join(', ');
        },
      },
      comment: {
        info: 'Please add any extra info about this occurrence.',
        icon: 'comment',
        type: 'text',
      },
    },
    verify(attrs) {
      if (!attrs.taxon) {
        return { taxon: "can't be blank" };
      }

      if (!attrs.stage) {
        return { stage: "can't be blank" };
      }
      return null;
    },
  },

  verify(attrs) {
    const attributes = {};

    // location
    const location = attrs.location || {};
    if (!location.latitude) {
      attributes.location = 'missing';
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

    // location type
    if (!attrs.location_type) {
      attributes.location_type = "can't be blank";
    }

    if (!attrs.recorders || !attrs.recorders.length) {
      attributes.recorders = "can't be blank";
    }

    return attributes;
  },

  onSend() {
    return {
      8: userModel.attrs.email,
    };
  },
};

export default survey;
