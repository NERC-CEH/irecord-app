/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'log',
  'helpers/validate'
], function (Marionette, JST, log, validate) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['user/register/main'],

    events: {
      'click #register-button': 'register'
    },

    register: function (e) {
      //validate
      var $inputPassword = this.$el.find('#password');
      var $inputEmail = this.$el.find('#email');

      let email = $inputEmail.val(),
        password = $inputPassword.val();

      //validate
      if (this.valid($inputEmail, $inputPassword)) {
        this.trigger('register', email, password);
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
