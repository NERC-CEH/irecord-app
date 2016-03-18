import Marionette from 'marionette';
import validate from '../../../helpers/validate';
import JST from '../../../JST';

export default Marionette.ItemView.extend({
  template: JST['user/login/main'],

  events: {
    'click #login-button': 'login',
  },

  login() {
    const $inputPassword = this.$el.find('#user-password');
    const $inputEmail = this.$el.find('#user-email');

    const data = {
      email: $inputEmail.val(),
      password: $inputPassword.val(),
    };

    this.trigger('form:submit', data);
  },

  onFormDataInvalid(errors) {
    const $view = this.$el;
    validate.updateViewFormErrors($view, errors, '#user-');
  },
});

