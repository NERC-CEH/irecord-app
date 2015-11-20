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
    tagName: 'nav',
    template: JST['common/header'],

    events: {
      'click a[data-rel="back"]': "navigateBack"
    },

    navigateBack: function () {
      window.history.back();
    }
  });

  return Page;
});
