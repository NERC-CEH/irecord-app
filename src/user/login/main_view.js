/** ****************************************************************************
 * User Login main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Validate from 'helpers/validate';
import JST from 'JST';
import CONFIG from 'config';

export default Marionette.View.extend({
  template: JST['user/login/main'],

  events: {
    'click #login-button': 'login',
  },

  login() {
    const $inputPassword = this.$el.find('#user-password');
    const $inputName = this.$el.find('#user-name');

    const data = {
      name: $inputName.val(),
      password: $inputPassword.val(),
    };

    this.trigger('form:submit', data);
  },

  onFormDataInvalid(errors) {
    const $view = this.$el;
    Validate.updateViewFormErrors($view, errors, '#user-');
  },

  serializeData() {
    return {
      irecord_url: CONFIG.irecord_url,
    };
  },
});

