/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'log',
  'morel'
], function (Marionette, JST, log, morel) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['records/show/main'],
    triggers: {
      'click #sync-btn': 'sync:init'
    },

    serializeData: function () {
      let recordModel = this.model.get('record');
      let occ = recordModel.occurrences.at(0);
      let specie = occ.get('taxon');
      let userModel = this.model.get('user');

      let taxon = userModel.get('useScientificNames') ?
        specie.taxon : specie.common_name || specie.taxon;

      let syncStatus = recordModel.getSyncStatus();

      let location = recordModel.printLocation();

      return {
        onDatabase: syncStatus === morel.SYNCED,
        taxon: taxon,
        location: location,
        date: recordModel.get('date').print(),
        number: occ.get('number') && occ.get('number').limit(20),
        stage: occ.get('stage') && occ.get('stage').limit(20),
        comment: occ.get('comment') && occ.get('comment').limit(20)
      };
    }

  });

  return View;
});
