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
    tagName: 'nav',
    template: JST['records/edit/header'],

    events: {
      'click a[data-rel="back"]': "navigateBack",
      'click #record-save-btn': 'save'
    },

    navigateBack: function () {
      window.history.back();
    },

    save: function (e) {
      log('records:edit: saving.' ,'d');
      app.trigger('records:edit:save', e);
    }
  });

  return Page;
});
