/** ****************************************************************************
 * Plant survey configuration file.
 **************************************************************************** */
import DateHelp from 'helpers/date';
import appModel from 'app_model';
import userModel from 'user_model';
import defaultSurvey from '../default';

const survey = {
  name: 'default',
  label: 'General',
  id: 571,
  complex: true,

  webForm: 'enter-app-record-list',

  editForm: ['smp:location', 'smp:date', 'smp:recorders', 'smp:comment'],

  attrs: {
    location: {
      required: true,
      id: 'entered_sref',
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

        if (submission.fields.entered_sref_system === 'OSGB') {
          return gridref; // TODO: backwards comp, remove when v5 Beta testing finished
        }

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
      icon: 'calendar',
      max: () => new Date(),
    },
    recorders: {
      id: 127,
      type: 'inputList',
      placeholder: 'Recorder name',
      icon: 'people',
      required: true,
      info:
        'If anyone helped with documenting the record please enter their name here.',
    },

    comment: {
      info: 'Please add any extra info about this list.',
      icon: 'comment',
      type: 'text',
    },
  },

  smp: {
    async create(Sample, Occurrence, taxon) {
      const sample = await defaultSurvey.create(
        Sample,
        Occurrence,
        null,
        taxon,
        true,
        true
      );

      const sampleSurvey = sample.getSurvey();
      if (
        sampleSurvey.occ.attrs.number &&
        sampleSurvey.occ.attrs.number.incrementShortcut
      ) {
        sample.occurrences[0].attrs.number = 1;
      }

      if (appModel.attrs.geolocateSurveyEntries) {
        sample.startGPS();
      }

      return sample;
    },
  },

  verify(attrs) {
    const attributes = {};

    // location
    const location = attrs.location || {};
    if (!location.latitude) {
      attributes.location = 'missing';
    }
    if (!location.name) {
      attributes.name = 'missing';
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

  create(Sample) {
    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.hasLogIn()) {
      recorders.push(
        `${userModel.attrs.firstname} ${userModel.attrs.secondname}`
      );
    }

    const sample = new Sample({
      attrs: { recorders },
      metadata: {
        complex_survey: survey.name,
      },
    });

    sample.startGPS();

    return Promise.resolve(sample);
  },
};

export default survey;
