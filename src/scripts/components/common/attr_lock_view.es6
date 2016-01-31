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
    template: JST['records/edit_attr/lock'],

    initialize: function () {
      this.onLockClick = this.options.onLockClick;
      let appModel = this.model.get('appModel');
      this.listenTo(appModel, 'change:attrLocks', this.render);
    },

    triggers: {
      'click #lock-btn': 'lock:click'
    },

    serializeData: function () {
      let appModel = this.model.get('appModel');
      let recordModel = this.model.get('recordModel');
      let occ = recordModel.occurrences.at(0);

      let value;

      switch (this.options.attr) {
        case 'date':
        case 'location':
          //sample
          value = recordModel.get(this.options.attr);
          break;
        default:
          //occurrence
          value = occ.get(this.options.attr);
      }

      let locked = false;
        //check if the same value has been locked
        locked = appModel.isAttrLocked(this.options.attr, value)


      return {
        locked: locked
      }
    }
  });

  return View;
});
