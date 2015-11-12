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
    id: 'records-header',
    tagName: 'h1',
    template: JST['records/list/header']
  });

  return Page;
});
