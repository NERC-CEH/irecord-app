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
      if (!email || !password) {return;}

//      $inputEmail.focusout(function () {
//        var valid = validate.email($(this).val());
//        var $inputBox = $('[name="email"]');
//        if (!valid) {
//          $inputBox.addClass('input-error');
//        } else {
//          $inputBox.removeClass('input-error');
//        }
//      });

      this.trigger('login:submit', email, password);
    }

  });

  return View;
});
