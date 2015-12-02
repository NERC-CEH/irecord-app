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
    initialize: function (options) {
      this.template =  JST['records/edit_attr/' + options.attr];
    }

  });

  return View;
});
