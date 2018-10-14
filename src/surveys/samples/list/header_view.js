/** ****************************************************************************
 * Sample List header view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import JST from 'JST';

export default Marionette.View.extend({
  id: 'samples-header',
  tagName: 'nav',
  template: JST['surveys/samples/list/header'],

  triggers: {
    'click #create-new-btn': 'create'
  },

  events: {
    'change input': 'photoUpload',
    'click a[data-rel="back"]': 'navigateBack'
  },

  navigateBack() {
    window.history.back();
  },

  photoUpload(e) {
    this.trigger('photo:upload', e);
  },

  onAttach() {
    // create camera/gallery selection
    if (window.cordova) {
      this.$el.find('.img-picker input').remove();

      this.$el.find('.img-picker').on('click', () => {
        this.trigger('photo:selection');
      });
    }
  },

  serializeData() {
    return {
      training: this.model.metadata.training
    };
  }
});
