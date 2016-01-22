/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'app',
  'JST'
], function (Marionette, Log, App, JST) {
  'use strict';

  var Page = Marionette.ItemView.extend({
    id: "records-header",
    tagName: 'nav',
    template: JST['records/list/header'],

    triggers: {
      'change input': 'photo:upload'
    }
  });

  return Page;
});
