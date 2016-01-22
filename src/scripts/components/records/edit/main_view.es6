/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'JST'
], function (Marionette, Log, JST) {
  'use strict';

  let View = Marionette.ItemView.extend({
    template: JST['records/edit/record'],

    serializeData: function () {
      let recordModel = this.model.get('recordModel');
      let occ = recordModel.occurrences.at(0);
      let specie = occ.get('taxon');
      let appModel = this.model.get('appModel');

      let taxon = appModel.get('useScientificNames') ?
        specie.taxon : specie.common_name || specie.taxon;

      let location = recordModel.printLocation();

      return {
        id: recordModel.id || recordModel.cid,
        taxon: taxon,
        isLocating: recordModel.locating >= 0,
        location: location,
        date: recordModel.get('date').print(),
        number: occ.get('number') && occ.get('number').limit(20),
        stage: occ.get('stage') && occ.get('stage').limit(20),
        comment: occ.get('comment') && occ.get('comment').limit(20),
        locks: appModel.get('attrLocks')
      };
    }
  });

  return View;
});
