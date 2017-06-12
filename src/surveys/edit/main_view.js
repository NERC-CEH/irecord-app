/** ****************************************************************************
 * Surveys Edit main view.
 *****************************************************************************/
import Indicia from 'indicia';
import Marionette from 'backbone.marionette';
import StringHelp from 'helpers/string';
import DateHelp from 'helpers/date';
import JST from 'JST';

export default Marionette.View.extend({
  template: JST['surveys/edit/main'],

  triggers: {
    'click a#location-button': 'location:update',
  },

  initialize() {
    const sample = this.model.get('sample');
    this.listenTo(sample, 'request sync error geolocation', this.render);
  },

  serializeData() {
    const sample = this.model.get('sample');
    // const appModel = this.model.get('appModel');

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    return {
      id: sample.cid,
      training: sample.metadata.training,
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      location: locationPrint,
      locationName: location.name,
      'vice-county': sample.get('vice-county'),
      date: DateHelp.print(sample.get('date'), true),
      species: sample.samples.length,
      recorders: (sample.get('recorders') || []).length,
      comment: sample.get('comment') && StringHelp.limit(sample.get('comment')),
      locks: {},
    };
  },
});
