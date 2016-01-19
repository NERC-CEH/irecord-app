/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'log'
], function (Marionette, JST, log) {
  'use strict';

  let View = Marionette.ItemView.extend({
    template: JST['records/edit_attr/lock'],

    initialize: function () {
      this.onLockClick = this.options.onLockClick;
    },

    triggers: {
      'click #lock-btn': 'lock:click'
    },

    modelEvents: {
      'change:attrLocks': 'render'
    },

    serializeData: function () {
      return {
        locked: this.model.getAttrLock(this.options.attr)
      }
    }
  });

  return View;
});
