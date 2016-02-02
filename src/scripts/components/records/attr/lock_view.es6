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
    template: JST['records/attr/lock'],

    triggers: {
      'click #lock-btn': 'lockClick'
    },

    modelEvents: {
      'change': 'render'
    }
  });

  return View;
});
