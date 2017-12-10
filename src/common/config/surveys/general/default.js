/** ****************************************************************************
 * General survey configuration file.
 **************************************************************************** */
import $ from 'jquery';
import Indicia from 'indicia';
import DateHelp from 'helpers/date';

const survey = {
  name: 'default',
  survey_id: 374,
  input_form: 'enter-app-record',

  taxonGroups: [], // all

  editForm: ['occ:number', 'occ:stage', 'smp:comment', 'occ:identifiers'],

  attrs: {
    smp: {
      location: {
        values(location, submission) {
          // convert accuracy for map and gridref sources
          const accuracy = location.accuracy;
          const attributes = {};
          const keys = survey.attrs.smp;
          attributes.location_name = location.name; // this is a native indicia attr
          attributes[keys.location_source.id] = location.source;
          attributes[keys.location_gridref.id] = location.gridref;
          attributes[keys.location_altitude.id] = location.altitude;
          attributes[keys.location_altitude_accuracy.id] =
            location.altitudeAccuracy;
          attributes[keys.location_accuracy.id] = accuracy;

          // add other location related attributes
          $.extend(submission.fields, attributes);

          return `${location.latitude}, ${location.longitude}`;
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

      date: {
        values(date) {
          return DateHelp.print(date);
        },
        isValid: val => val && val.toString() !== 'Invalid Date',
        type: 'date',
        max: () => new Date(),
      },

      group: {
        values(group) {
          return group.id;
        },
        type: 'input',
      },

      comment: {
        info: 'Please add any extra info about this record.',
        icon: 'comment',
        type: 'text',
      },
    },
    occ: {
      training: {
        id: 'training',
      },

      taxon: {
        values(taxon) {
          return taxon.warehouse_id;
        },
      },
      number: {
        id: 16,
        info: 'How many individuals of this type?',
        icon: 'number',
      },
      'number-ranges': {
        id: 523,
        default: 'Present',
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
      identifiers: {
        id: 18,
        info:
          'If anyone helped with the identification please enter their name here.',
        icon: 'user-plus',
        type: 'input',
      },
    },
  },
  verify(attrs) {
    const attributes = {};
    const occurrences = {};

    // todo: remove this bit once sample DB update is possible
    // check if saved or already send
    if (!this.metadata.saved || this.getSyncStatus() === Indicia.SYNCED) {
      attributes.send = false;
    }

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

    // location type
    if (!attrs.location_type) {
      attributes.location_type = "can't be blank";
    }

    // occurrences
    if (this.occurrences.length === 0) {
      attributes.occurrences = 'no species selected';
    } else {
      this.occurrences.each(occurrence => {
        const errors = occurrence.validate(null, { remote: true });
        if (errors) {
          const occurrenceID = occurrence.cid;
          occurrences[occurrenceID] = errors;
        }
      });
    }

    return [attributes, null, occurrences];
  },
};

export default survey;
