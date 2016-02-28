/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'browser',
  'app',
  'JST'
], function (Marionette, Log, Browser, App, JST) {
  'use strict';

  var View = Marionette.ItemView.extend({
    template: JST['user/register/main'],

    events: {
      'click #register-button': 'register',
      'click #terms-agree-button': 'toggleRegisterButton',
      'toggle #terms-agree-button': 'toggleRegisterButton',
    },

    onRender: function () {
      this.$registerButton = this.$el.find('#register-button');
      this.$registerButton.prop('disabled', true);
    },

    register: function (e) {
      //todo: add validation
      var data = {};

      let $emailInput  = this.$el.find('input[name=email]');
      let $passwordInput  = this.$el.find('input[name=password]');
      let $passwordConfInput = this.$el.find('input[name=password-confirm]');

      //user logins
      this.email = $emailInput.val(); //save it for future
      var firstname = this.$el.find('input[name=firstname]').val();
      var secondname = this.$el.find('input[name=secondname]').val();
      var password = $passwordInput.val();
      var passwordConfirm = $passwordConfInput.val();

      data.email = this.email;
      data.firstname = firstname;
      data.secondname = secondname;
      data.password = password;
      data['password-confirm'] = passwordConfirm;

      this.trigger('form:submit', data);
    },

    onFormDataInvalid: function (errors) {
      var $view = this.$el;

      var clearFormErrors = function(){
        var $form = $view.find(".form");
        $form.find("span.error").each(function(){
          $(this).remove();
        });
        $form.find(".input-row.error").each(function(){
          $(this).removeClass("error");
        });
      }

      var markErrors = function(value, key){
        var $controlGroup = $view.find("#user-" + key).parent();
        var $errorEl = $("<span>", { class: "error", text: value });
        $controlGroup.append($errorEl).addClass("error");
      }

      clearFormErrors();
      _.each(errors, markErrors);
    },

    /**
     * Shows/hides the registration submit button.
     *
     * @param e
     */
    toggleRegisterButton: function (e) {
      //enable 'Create account' button on Terms agreement
      var active = $(e.currentTarget).hasClass('active');

      if (e.type != 'toggle' && !Browser.isMobile()) {
        //invert because it takes time to get the class
        active = !active;
        $(e.currentTarget).toggleClass('active', active);
      }

      this.$registerButton.prop('disabled', !active);
    }
  });

  return View;
});
