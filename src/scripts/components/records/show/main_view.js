/** ****************************************************************************
 * Record Show main view.
 *****************************************************************************/
import Marionette from 'marionette';
import Morel from 'morel';
import JST from '../../../JST';
import dateHelp from '../../../helpers/date';
import stringHelp from '../../../helpers/string';

export default Marionette.ItemView.extend({
  template: JST['records/show/main'],

  initialize() {
    this.listenTo(this.model.get('recordModel'), 'sync:request sync:done sync:error', this.render);
  },

  triggers: {
    'click #sync-btn': 'sync:init',
  },

  serializeData() {
    const recordModel = this.model.get('recordModel');
    const occ = recordModel.occurrences.at(0);
    const specie = occ.get('taxon');

    // taxon
    const scientificName = specie.scientific_name;
    let commonName = specie[specie.found_in_name];
    if (specie.found_in_name === 'scientific_name') {
      // show recommended name
      if (specie.commonName) {
        commonName = specie.commonName;
      } else {
        commonName = '';
      }
    }

    const syncStatus = recordModel.getSyncStatus();

    const locationPrint = recordModel.printLocation();
    const location = recordModel.get('location') || {};

    return {
      isSynchronising: syncStatus === Morel.SYNCHRONISING,
      onDatabase: syncStatus === Morel.SYNCED,
      scientific_name: scientificName,
      commonName,
      location: locationPrint,
      location_name: location.name,
      date: dateHelp.print(recordModel.get('date')),
      number: occ.get('number') && stringHelp.limit(occ.get('number')),
      stage: occ.get('stage') && stringHelp.limit(occ.get('stage')),
      comment: occ.get('comment'),
      images: occ.images,
    };
  },
});

