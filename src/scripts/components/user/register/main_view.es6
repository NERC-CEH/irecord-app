/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'validate',
  'app',
  'JST'
], function (Marionette, Log, Validate, App, JST) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['user/register/main'],

    events: {
      'click #register-button': 'register',
      'click #terms-agree-button': 'toggleRegisterButton',
    },

    onRender: function () {
      this.$registerButton = this.$el.find('#register-button');
      this.$registerButton.prop('disabled', true);
    },

    register: function (e) {
      //todo: add validation
      var data = {};

      let $emailInput  = this.$el.find('input[name=email]');
      let $passwordInput  = this.$el.find('input[name=pass]');
      let $passwordConfInput = this.$el.find('input[name=passConf]');

      //validate
      if (!this.valid($emailInput, $passwordInput, $passwordConfInput)) {
        return;
      }

      //user logins
      this.email = $emailInput.val(); //save it for future
      var name = this.$el.find('input[name=name]').val();
      var surname = this.$el.find('input[name=surname]').val();
      var pass = $passwordInput.val();
      var passConf = $passwordConfInput.val();

      data.email = this.email;
      data.firstname = name;
      data.secondname = surname;
      data.password = pass;
      data['password-confirm'] = passConf;

      this.trigger('register', data);
    },

    valid: function ($inputEmail, $inputPassword, $inputPasswordConf) {
      let valid = true;
      let email = $inputEmail.val(),
          password = $inputPassword.val(),
          passwordConf = $inputPasswordConf.val();

      if (password !== passwordConf) {
        $inputPasswordConf.addClass('error');
        valid = false;
      } else {
        $inputPasswordConf.removeClass('error');
      }

      if (!password || password.length < 5) {
        $inputPassword.addClass('error');
        valid = false;
      } else {
        $inputPassword.removeClass('error');
      }

      if (!Validate.email(email)) {
        $inputEmail.addClass('error');
        valid = false;
      } else {
        $inputEmail.removeClass('error');
      }

      return valid;
    },

    /**
     * Shows/hides the registration submit button.
     *
     * @param e
     */
    toggleRegisterButton: function (e) {
      //enable 'Create account' button on Terms agreement
      var active = $(e.currentTarget).hasClass('active');
      $(e.currentTarget).toggleClass('active', !active);

      this.$registerButton.prop('disabled', active == true);

    }
  });

  return View;
});
