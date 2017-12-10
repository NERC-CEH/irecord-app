/** ****************************************************************************
 * Sample Edit main view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import JST from 'JST';
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';
import AttrsView from './attrs_view';
import './styles.scss';

export default Marionette.View.extend({
  template: JST['samples/edit/main'],

  regions: {
    attrs: {
      el: '#attrs',
      replaceElement: true,
    },
  },

  onRender() {
    this.showChildView('attrs', new AttrsView({ model: this.model }));
  },

  triggers: {
    'click a#species-button': 'taxon:update',
  },

  /**
   * Need to push the main content down due to the subheader
   * @returns {string}
   */
  className() {
    const sample = this.model.get('sample');
    let amount = 0;

    let classes = 'attr-edit slim ';

    if (sample.get('group')) {
      amount++;
    }

    if (sample.metadata.training) {
      amount++;
    }

    // eslint-disable-next-line
    classes += amount > 0 ? `band-margin-${amount}` : '';
    return classes;
  },

  initialize() {
    const sample = this.model.get('sample');
    this.listenTo(sample, 'geolocation', this.render);
  },

  serializeData() {
    const sample = this.model.get('sample');
    const occ = sample.getOccurrence();
    const specie = occ.get('taxon') || {};
    const appModel = this.model.get('appModel');

    // taxon
    const scientificName = specie.scientific_name;
    const commonName = specie.common_name;

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    const attrLocks = {
      location: appModel.isAttrLocked('location', location),
      locationName: appModel.isAttrLocked('locationName', location.name),
    };

    return {
      id: sample.cid,
      scientificName: StringHelp.limit(scientificName),
      commonName: StringHelp.limit(commonName),
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      location: StringHelp.limit(locationPrint),
      locationName: StringHelp.limit(location.name),
      date: DateHelp.print(sample.get('date'), true),
      locks: attrLocks,
    };
  },
});
