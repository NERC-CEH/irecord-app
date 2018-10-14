/** ****************************************************************************
 * Surveys Edit main view.
 **************************************************************************** */
import Indicia from 'indicia';
import Marionette from 'backbone.marionette';
import StringHelp from 'helpers/string';
import DateHelp from 'helpers/date';
import JST from 'JST';

export default Marionette.View.extend({
  template: JST['surveys/edit/main'],

  triggers: {
    'click a#location-button': 'location:update'
  },

  /**
   * Need to push the main content down due to the subheader
   * @returns {string}
   */
  className() {
    const sample = this.model.get('sample');
    let amount = 1;

    let classes = 'slim ';

    if (sample.metadata.training) {
      amount++;
    }

    // eslint-disable-next-line
    classes += amount > 0 ? `band-margin-${amount}` : '';
    return classes;
  },

  initialize() {
    const sample = this.model.get('sample');
    this.listenTo(
      sample,
      'request:remote sync:remote error:remote geolocation',
      this.render
    );
  },

  serializeData() {
    const sample = this.model.get('sample');

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    const vc = sample.get('vice-county') || {};

    // calculate unique taxa
    const uniqueTaxa = {};
    sample.samples.each(childSample => {
      const occ = childSample.getOccurrence();
      if (occ) {
        const taxon = occ.get('taxon') || {};
        uniqueTaxa[taxon.warehouse_id] = true;
      }
    });

    return {
      id: sample.cid,
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      locationEditAllowed: this.options.locationEditAllowed,
      location: locationPrint,
      locationName: location.name,
      'vice-county': vc.name,
      date: DateHelp.print(sample.get('date'), true),
      species: Object.keys(uniqueTaxa).length,
      recorders: (sample.get('recorders') || []).length,
      comment: StringHelp.limit(sample.get('comment')),
      locks: {}
    };
  }
});
