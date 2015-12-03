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
    },

    triggers: {
      'click #record-save-btn': 'save'
    },

    navigateBack: function () {
      window.history.back();
    }
  });

  return Page;
});
