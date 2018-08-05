/** ****************************************************************************
 * User Reset main view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import Validate from 'helpers/validate';
import JST from 'JST';
import './styles.scss';

export default Marionette.View.extend({
  template: JST['user/reset/main'],

  events: {
    'click #reset-button': 'reset',
  },

  reset() {
    const $inputName = this.$el.find('#user-name');

    const data = {
      name: $inputName.val(),
    };

    this.trigger('form:submit', data);
  },

  onFormDataInvalid(errors) {
    const $view = this.$el;
    Validate.updateViewFormErrors($view, errors, '#user-');
  },
});
