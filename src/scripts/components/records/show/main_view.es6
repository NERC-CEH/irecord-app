/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'log'
], function (Marionette, JST, log) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['records/show/main'],
    triggers: {
      'click #sync-btn': 'sync:init'
    }
  });

  return View;
});
