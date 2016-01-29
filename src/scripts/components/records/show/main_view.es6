/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'morel',
  'log',
  'JST'
], function (Marionette, Morel, Log, JST) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['records/show/main'],

    initialize: function () {
      this.listenTo(this.model.get('recordModel'), 'sync:request sync:done sync:error', this.render);
    },

    triggers: {
      'click #sync-btn': 'sync:init'
    },

    serializeData: function () {
      let recordModel = this.model.get('recordModel');
      let occ = recordModel.occurrences.at(0);
      let specie = occ.get('taxon');
      let appModel = this.model.get('appModel');

      let taxon = appModel.get('useScientificNames') ?
        specie.taxon : specie.common_name || specie.taxon;

      let syncStatus = recordModel.getSyncStatus();

      let location = recordModel.printLocation();

      return {
        isSynchronising: syncStatus === Morel.SYNCHRONISING,
        onDatabase: syncStatus === Morel.SYNCED,
        taxon: taxon,
        location: location,
        date: recordModel.get('date').print(),
        number: occ.get('number') && occ.get('number').limit(20),
        stage: occ.get('stage') && occ.get('stage').limit(20),
        comment: occ.get('comment')
      };
    }

  });

  return View;
});
