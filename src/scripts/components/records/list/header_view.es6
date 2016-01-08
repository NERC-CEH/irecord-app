/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'app',
  'JST',
  'log'
], function (Marionette, app, JST, log) {
  'use strict';

  var Page = Marionette.ItemView.extend({
    id: "records-header",
    tagName: 'nav',
    template: JST['records/list/header'],

    events: {
      'change input': 'photoUpload'
    },

    photoUpload: function (e) {
      log('records:list: photo upload.' ,'d');
      app.trigger('records:list:upload', e);
    }
  });

  return Page;
});
