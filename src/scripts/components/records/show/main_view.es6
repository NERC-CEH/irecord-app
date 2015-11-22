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
    id: 'records-list',
    template: JST['records/show/main']
  });

  return View;
});
