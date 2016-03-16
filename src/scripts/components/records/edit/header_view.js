import Marionette from '../../../../vendor/marionette/js/backbone.marionette';
import Morel from '../../../../vendor/morel/js/morel';
import JST from '../../../JST';

export default Marionette.ItemView.extend({
  tagName: 'nav',
  template: JST['records/edit/header'],

  events: {
    'click a[data-rel="back"]': "navigateBack",
  },

  triggers: {
    'click #record-save-btn': 'save'
  },

  modelEvents: {
    'sync:request sync:done sync:error': 'render'
  },

  navigateBack: function () {
    window.history.back();
  },

  serializeData: function () {
    return {
      isSynchronising: this.model.getSyncStatus() == Morel.SYNCHRONISING
    }
  }
});

