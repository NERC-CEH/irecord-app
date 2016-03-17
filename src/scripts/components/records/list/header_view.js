/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
import Marionette from 'marionette';
import log from '../../../helpers/log';
import App from '../../../app';
import JST from '../../../JST';


export default Marionette.ItemView.extend({
  id: "records-header",
  tagName: 'nav',
  template: JST['records/list/header'],

  events: {
    'change input': 'photoUpload'
  },

  photoUpload: function (e) {
    this.trigger('photo:upload', e);
  },

  onShow: function () {
    let that = this;

    //create android camera/gallery selection
    if (window.cordova && deviceIsAndroid) {
      this.$el.find('.img-picker input').remove();

      this.$el.find('.img-picker').on('click', function () {
        that.trigger('photo:selection');
      });
    }
  }
});

