/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'app',
  'JST',
  'log',
  'helpers/validate'
], function (Marionette, app, JST, log, validate) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['app/settings/main'],

    events: {
      'click #use-scientific-btn': 'onSettingToggled'
    },

    onRender: function () {
   //   this.$registerButton = this.$el.find('#register-button');
     // this.$registerButton.prop('disabled', true);
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
