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
    template: JST['app/info/main'],

    events: {
      'click #logout-button': 'logout'
    },

    modelEvents: {
      'change': 'render'
    },

    logout: function () {
      this.trigger('logout');
    }
  });

  return View;
});
