/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'log'
], function (Marionette, JST, log) {
  'use strict';

  var Page = Marionette.ItemView.extend({
    id: 'records-list',
    template: JST['records/show/main']
  });

  return Page;
});
