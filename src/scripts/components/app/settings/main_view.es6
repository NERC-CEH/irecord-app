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
      'toggle #use-scientific-btn': 'onSettingToggled',
      'click #use-scientific-btn': 'onSettingToggled',
      'toggle #use-gridref-btn': 'onSettingToggled',
      'click #use-gridref-btn': 'onSettingToggled',
      'toggle #use-autosync-btn': 'onSettingToggled',
      'click #use-autosync-btn': 'onSettingToggled'
    },

    onSettingToggled: function (e) {
      let setting = $(e.currentTarget).data('setting');
      let active = $(e.currentTarget).hasClass('active');

      if (e.type != 'toggle') {
        //invert because it takes time to get the class
        active = !active;
        $(e.currentTarget).toggleClass('active', active);
      }

      this.trigger('setting:toggled', setting, active)
    }
  });

  return View;
});
