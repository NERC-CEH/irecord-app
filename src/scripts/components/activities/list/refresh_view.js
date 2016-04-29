/******************************************************************************
 * Activities list refresh view.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from '../../../JST';
import Log from '../../../helpers/log';

export default Marionette.ItemView.extend({
  template: JST['activities/list/refresh'],

  triggers: {
    'click #refresh-btn': 'refreshClick'
  },

  modelEvents: {
    'change': 'render'
  }
});
