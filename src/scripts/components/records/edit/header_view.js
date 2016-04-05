/** ****************************************************************************
 * Record Edit header view.
 *****************************************************************************/
import Marionette from 'marionette';
import Morel from 'morel';
import JST from '../../../JST';

export default Marionette.ItemView.extend({
  tagName: 'nav',
  template: JST['records/edit/header'],

  events: {
    'click a[data-rel="back"]': 'navigateBack',
  },

  triggers: {
    'click #record-save-btn': 'save',
  },

  modelEvents: {
    'request sync error': 'render',
  },

  navigateBack() {
    window.history.back();
  },

  serializeData() {
    return {
      isSynchronising: this.model.getSyncStatus() === Morel.SYNCHRONISING,
    };
  },
});

