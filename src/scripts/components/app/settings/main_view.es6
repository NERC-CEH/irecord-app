/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'browser',
  'JST',
], function (Marionette, Log, Browser, JST) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['app/settings/main'],

    events: {
      'toggle #use-gridref-btn': 'onSettingToggled',
      'click #use-gridref-btn': 'onSettingToggled',
      'toggle #use-autosync-btn': 'onSettingToggled',
      'click #use-autosync-btn': 'onSettingToggled'
    },

    onSettingToggled: function (e) {
      let setting = $(e.currentTarget).data('setting');
      let active = $(e.currentTarget).hasClass('active');

      if (e.type != 'toggle' && !Browser.isMobile()) {
        //Browser.isMobile() android generates both swipe and click

        active = !active; //invert because it takes time to get the class
        $(e.currentTarget).toggleClass('active', active);
      }

      this.trigger('setting:toggled', setting, active)
    }
  });

  return View;
});
