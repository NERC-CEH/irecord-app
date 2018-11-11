/** ****************************************************************************
 * User Reset main view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import Validate from 'helpers/validate';
import './styles.scss';
import template from './templates/main.tpl';

export default Marionette.View.extend({
  template,

  events: {
    'click #reset-button': 'reset'
  },

  reset() {
    const $inputName = this.$el.find('#user-name');

    const data = {
      name: $inputName.val()
    };

    this.trigger('form:submit', data);
  },

  onFormDataInvalid(errors) {
    const $view = this.$el;
    Validate.updateViewFormErrors($view, errors, '#user-');
  }
});
