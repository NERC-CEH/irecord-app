/** ****************************************************************************
 * Sample Edit header view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import JST from 'JST';

export default Marionette.View.extend({
  tagName: 'nav',
  template: JST['surveys/edit/header'],

  events: {
    'click a[data-rel="back"]': 'navigateBack'
  },

  triggers: {
    'click #sample-save-btn': 'save'
  },

  modelEvents: {
    'request:remote sync:remote error:remote': 'render'
  },

  navigateBack() {
    window.history.back();
  },

  serializeData() {
    return {
      training: this.model.metadata.training,
      isSynchronising: this.model.getSyncStatus() === Indicia.SYNCHRONISING
    };
  }
});
