/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'validate',
  'JST'
], function (Marionette, Log, Validate, JST) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['user/login/main'],

    events: {
      'click #login-button': 'login'
    },

    login: function (e) {
      //validate
      var $inputPassword = this.$el.find('#password');
      var $inputEmail = this.$el.find('#email');

      let email = $inputEmail.val(),
        password = $inputPassword.val();

      //validate
      if (this.valid($inputEmail, $inputPassword)) {
        this.trigger('login', email, password);
      }
    },

    valid: function ($inputEmail, $inputPassword) {
      let valid = true;
      let email = $inputEmail.val(),
        password = $inputPassword.val();

      if (!password) {
        $inputPassword.addClass('error');
        valid = false;
      } else {
        $inputPassword.removeClass('error');
      }

      if (!validate.email(email)) {
        $inputEmail.addClass('error');
        valid = false;
      } else {
        $inputEmail.removeClass('error');
      }

      return valid;
    }

  });

  return View;
});
