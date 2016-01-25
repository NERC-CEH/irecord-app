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

    events: {
      'change input': 'photoUpload'
    },

    photoUpload: function (e) {
      this.trigger('photo:upload', e);
    }
  });

  return Page;
});
