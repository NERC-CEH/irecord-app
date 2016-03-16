import Marionette from '../../../../vendor/marionette/js/backbone.marionette';
import validate from '../../../helpers/validate';
import JST from '../../../JST';

export default Marionette.ItemView.extend({
  template: JST['user/login/main'],

  events: {
    'click #login-button': 'login'
  },

  login: function (e) {
    var $inputPassword = this.$el.find('#user-password');
    var $inputEmail = this.$el.find('#user-email');

    let data = {
      email: $inputEmail.val(),
      password: $inputPassword.val()
    };

    this.trigger('form:submit', data);
  },

  onFormDataInvalid: function (errors) {
    var $view = this.$el;
    validate.updateViewFormErrors($view, errors, "#user-");
  }
});

