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

    triggers: {
      'click #lock-btn': 'lockClick'
    },

    modelEvents: {
      'change': 'render'
    }
  });

  return View;
});
