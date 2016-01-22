/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'JST',
], function (Marionette, Log, JST) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['app/settings/main'],

    events: {
      'click #use-scientific-btn': 'onSettingToggled',
      'click #use-gridref-btn': 'onSettingToggled',
      'click #use-autosync-btn': 'onSettingToggled'
    },

    onSettingToggled: function (e) {
      let active = $(e.currentTarget).hasClass('active');
      let setting = $(e.currentTarget).data('setting');

      //invert because it takes time to get the class
      this.trigger('setting:toggled', setting, !active)
    }
  });

  return View;
});
