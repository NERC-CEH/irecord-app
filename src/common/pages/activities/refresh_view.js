/** ****************************************************************************
 * Activities list refresh view.
 * Provides button for top right of header.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import template from './templates/refresh.tpl';

export default Marionette.View.extend({
  template,

  // Trigger a refresh even when the button is clicked
  triggers: {
    'click #refresh-btn': 'refreshClick'
  }
});
