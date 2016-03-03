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

      let location_print = recordModel.printLocation();
      let location = recordModel.get('location') || {};

      let attrLocks = {
        date: appModel.isAttrLocked('date', recordModel.get('date')),
        location: appModel.isAttrLocked('location', recordModel.get('location')),
        number: appModel.isAttrLocked('number', occ.get('number')),
        stage: appModel.isAttrLocked('stage', occ.get('stage')),
        comment: appModel.isAttrLocked('comment', occ.get('comment'))
      };

      return {
        id: recordModel.id || recordModel.cid,
        scientific_name: scientific_name,
        common_name: common_name,
        isLocating: recordModel.isGPSRunning(),
        isSynchronising: recordModel.getSyncStatus() == Morel.SYNCHRONISING,
        location: location_print,
        location_name: location.name,
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
