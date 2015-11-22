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
    template: JST['records/edit/record']
  });

  return View;
});
