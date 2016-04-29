/******************************************************************************
 * Activities list refresh view.
 * Provides button for top right of header.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from '../../../JST';
import Log from '../../../helpers/log';

export default Marionette.ItemView.extend({
  template: JST['activities/list/refresh'],

  // Trigger a refresh even when the button is clicked
  triggers: {
    'click #refresh-btn': 'refreshClick'
  },

  modelEvents: {
    'change': 'render'
  }
});
