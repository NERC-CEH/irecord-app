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

      //taxon
      let scientific_name = specie.scientific_name;
      let common_name = specie[specie.found_in_name];
      if (specie.found_in_name == 'scientific_name') {
        //show recommended name
        if (specie.common_name) {
          common_name = specie.common_name;
        } else {
          common_name = '';
        }
      }

      let syncStatus = recordModel.getSyncStatus();

      let location = recordModel.printLocation();

      return {
        isSynchronising: syncStatus === Morel.SYNCHRONISING,
        onDatabase: syncStatus === Morel.SYNCED,
        scientific_name: scientific_name,
        common_name: common_name,
        location: location,
        date: recordModel.get('date').print(),
        number: occ.get('number') && occ.get('number').limit(20),
        stage: occ.get('stage') && occ.get('stage').limit(20),
        comment: occ.get('comment'),
        images: occ.images
      };
    }

  });

  return View;
});
