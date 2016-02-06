/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'morel',
  'marionette',
  'log',
  'JST'
], function (Morel, Marionette, Log, JST) {
  'use strict';

  let View = Marionette.ItemView.extend({
    template: JST['records/edit/record'],

    initialize: function () {
      let recordModel = this.model.get('recordModel');
      this.listenTo(recordModel, 'sync:request sync:done sync:error', this.render);
    },

    serializeData: function () {
      let recordModel = this.model.get('recordModel');
      let occ = recordModel.occurrences.at(0);
      let specie = occ.get('taxon');
      let appModel = this.model.get('appModel');

      let taxon = appModel.get('useScientificNames') ?
        specie.taxon : specie.common_name || specie.taxon;

      let location = recordModel.printLocation();

      let attrLocks = {
        date: appModel.isAttrLocked('date', recordModel.get('date')),
        location: appModel.isAttrLocked('location', recordModel.get('location')),
        number: appModel.isAttrLocked('number', occ.get('number')),
        stage: appModel.isAttrLocked('stage', occ.get('stage')),
        comment: appModel.isAttrLocked('comment', occ.get('comment'))
      };

      return {
        id: recordModel.id || recordModel.cid,
        taxon: taxon,
        isLocating: recordModel.locating >= 0,
        isSynchronising: recordModel.getSyncStatus() == Morel.SYNCHRONISING,
        location: location,
        date: recordModel.get('date').print(),
        number: occ.get('number') && occ.get('number').limit(20),
        stage: occ.get('stage') && occ.get('stage').limit(20),
        comment: occ.get('comment') && occ.get('comment').limit(20),
        locks: attrLocks
      };
    }
  });

  return View;
});
