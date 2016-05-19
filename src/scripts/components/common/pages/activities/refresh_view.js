/** ****************************************************************************
 * Activities list refresh view.
 * Provides button for top right of header.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from '../../../../JST';

export default Marionette.ItemView.extend({
  template: JST['common/activities/refresh'],

  // Trigger a refresh even when the button is clicked
  triggers: {
    'click #refresh-btn': 'refreshClick',
  },
});
