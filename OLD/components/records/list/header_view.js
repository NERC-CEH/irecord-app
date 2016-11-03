/** ****************************************************************************
 * Record List header view.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from 'JST';

export default Marionette.ItemView.extend({
  id: 'records-header',
  tagName: 'nav',
  template: JST['records/list/header'],

  events: {
    'change input': 'photoUpload',
  },

  photoUpload(e) {
    this.trigger('photo:upload', e);
  },

  onShow() {
    const that = this;

    // create camera/gallery selection
    if (window.cordova) {
      this.$el.find('.img-picker input').remove();

      this.$el.find('.img-picker').on('click', () => {
        that.trigger('photo:selection');
      });
    }
  },

  serializeData() {
    return {
      activityOn: this.model.getAttrLock('activity'),
    };
  },
});

