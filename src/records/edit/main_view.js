/** ****************************************************************************
 * Record Edit main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Morel from 'morel';
import JST from 'JST';
import { DateHelp, StringHelp } from 'helpers';

import './styles.scss';

export default Marionette.View.extend({
  template: JST['records/edit/main'],

  initialize() {
    const recordModel = this.model.get('recordModel');
    this.listenTo(recordModel, 'request sync error geolocation', this.render);
  },

  serializeData() {
    const recordModel = this.model.get('recordModel');
    const occ = recordModel.occurrences.at(0);
    const specie = occ.get('taxon') || {};
    const appModel = this.model.get('appModel');

    // taxon
    const scientificName = specie.scientific_name;
    const commonName = specie.common_name;

    const locationPrint = recordModel.printLocation();
    const location = recordModel.get('location') || {};

    let numberLock = appModel.isAttrLocked('number', occ.get('number'));
    if (!numberLock) {
      numberLock = appModel.isAttrLocked('number-ranges', occ.get('number-ranges'));
    }

    const attrLocks = {
      date: appModel.isAttrLocked('date', recordModel.get('date')),
      location: appModel.isAttrLocked('location', recordModel.get('location')),
      number: numberLock,
      stage: appModel.isAttrLocked('stage', occ.get('stage')),
      identifiers: appModel.isAttrLocked('identifiers', occ.get('identifiers')),
      comment: appModel.isAttrLocked('comment', occ.get('comment')),
      activity: appModel.isAttrLocked('activity', recordModel.get('group')),
    };

    let number = occ.get('number') && StringHelp.limit(occ.get('number'));
    if (!number) {
      number = occ.get('number-ranges') && StringHelp.limit(occ.get('number-ranges'));
    }

    // show activity title.
    const group = recordModel.get('group');

    return {
      id: recordModel.id || recordModel.cid,
      scientificName,
      commonName,
      isLocating: recordModel.isGPSRunning(),
      isSynchronising: recordModel.getSyncStatus() === Morel.SYNCHRONISING,
      location: locationPrint,
      location_name: location.name,
      date: DateHelp.print(recordModel.get('date')),
      number,
      stage: occ.get('stage') && StringHelp.limit(occ.get('stage')),
      identifiers: occ.get('identifiers') && StringHelp.limit(occ.get('identifiers')),
      comment: occ.get('comment') && StringHelp.limit(occ.get('comment')),
      group_title: group ? group.title : null,
      locks: attrLocks,
    };
  },
});
