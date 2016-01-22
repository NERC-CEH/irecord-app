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
      var data = new FormData();

      //user logins
      this.email = this.$el.find('input[name=email]').val(); //save it for future
      var name = this.$el.find('input[name=name]').val();
      var surname = this.$el.find('input[name=surname]').val();
      var pass = this.$el.find('input[name=pass]').val();
      var passConf = this.$el.find('input[name=passConf]').val();

      if (pass !== passConf) {
        App.regions.dialog.show({title: 'Sorry, passwords don\'t match'});
        return;
      }

      data.append('email', this.email);
      data.append('firstname', name);
      data.append('secondname', surname);
      data.append('password', pass);
      data.append('password-confirm', passConf);

      this.trigger('register', data);
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
    },

    /**
     * Shows/hides the registration submit button.
     *
     * @param e
     */
    toggleRegisterButton: function (e) {
      //enable 'Create account' button on Terms agreement
      var agree = $(e.currentTarget).hasClass('active');
      if (agree) {
        this.$registerButton.prop('disabled', true);
      } else {
        this.$registerButton.prop('disabled', false);
      }
    }


  });

  return View;
});
