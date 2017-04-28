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
      location_name: location.name,
      date: DateHelp.print(sample.get('date'), true),
      species: sample.samples.length,
      identifiers: sample.get('identifiers') && StringHelp.limit(sample.get('identifiers')),
      comment: sample.get('comment') && StringHelp.limit(sample.get('comment')),
      locks: {},
    };
  },
});
