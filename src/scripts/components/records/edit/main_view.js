/** ****************************************************************************
 * Record Edit main view.
 *****************************************************************************/
import Marionette from 'marionette';
import Morel from 'morel';
import JST from '../../../JST';
import DateHelp from '../../../helpers/date';
import StringHelp from '../../../helpers/string';

export default Marionette.ItemView.extend({
  template: JST['records/edit/record'],

  initialize() {
    const recordModel = this.model.get('recordModel');
    this.listenTo(recordModel, 'request sync error geolocation', this.render);
  },

  serializeData() {
    const recordModel = this.model.get('recordModel');
    const occ = recordModel.occurrences.at(0);
    const specie = occ.get('taxon');
    const appModel = this.model.get('appModel');

    // taxon
    const scientificName = specie.scientific_name;
    let commonName = specie[specie.found_in_name];
    if (specie.found_in_name === 'scientific_name') {
      // show recommended name
      if (specie.common_name) {
        commonName = specie.common_name;
      } else {
        commonName = '';
      }
    }

    const locationPrint = recordModel.printLocation();
    const location = recordModel.get('location') || {};

    const attrLocks = {
      date: appModel.isAttrLocked('date', recordModel.get('date')),
      location: appModel.isAttrLocked('location', recordModel.get('location')),
      number: appModel.isAttrLocked('number', occ.get('number')),
      stage: appModel.isAttrLocked('stage', occ.get('stage')),
      comment: appModel.isAttrLocked('comment', occ.get('comment')),
    };

    return {
      id: recordModel.id || recordModel.cid,
      scientificName,
      commonName,
      isLocating: recordModel.isGPSRunning(),
      isSynchronising: recordModel.getSyncStatus() === Morel.SYNCHRONISING,
      location: locationPrint,
      location_name: location.name,
      date: DateHelp.print(recordModel.get('date')),
      number: occ.get('number') && StringHelp.limit(occ.get('number')),
      stage: occ.get('stage') && StringHelp.limit(occ.get('stage')),
      comment: occ.get('comment') && StringHelp.limit(occ.get('comment')),
      locks: attrLocks,
    };
  },
});
