/** ****************************************************************************
 * Record Edit footer view.
 *****************************************************************************/
import Marionette from 'marionette';
import _ from 'lodash';
import Morel from 'morel';
import Gallery from '../../common/gallery';;
import JST from '../../../JST';
import device from '../../../helpers/device';

const SavedImageView = Marionette.ItemView.extend({
  template: _.template('<span class="delete icon icon-cancel">' +
    '</span><img src="<%- obj.data %>" alt="">'),
  className: 'img',

  events: {
    'click span.delete': 'delete',
    'click img': 'photoView',
  },

  photoView(e) {
    this.trigger('photo:view', e);
  },

  delete(e) {
    this.trigger('photo:delete', e);
  },

  serializeData() {
    return {
      data: this.model.get('data'),
    };
  },
});

const EmptyView = Marionette.ItemView.extend({
  template: JST['records/edit/image_picker_empty'],
  tagName: 'span',
  className: 'empty',
});

export default Marionette.CompositeView.extend({
  id: 'edit-footer',
  template: JST['records/edit/image_picker_array'],
  initialize() {
    this.collection = this.model.occurrences.at(0).images;
  },

  events: {
    'change input': 'photoUpload',
  },

  photoUpload(e) {
    this.trigger('photo:upload', e);
  },

  childViewContainer: '#img-array',
  childView: SavedImageView,

  emptyView: EmptyView,

  modelEvents: {
    'request sync error': 'render',
  },

  serializeData() {
    return {
      isSynchronising: this.model.getSyncStatus() === Morel.SYNCHRONISING,
    };
  },

  onChildviewPhotoView(view, e) {
    const items = [];
    const options = {};

    this.collection.each((image, index) => {
      if (image.cid === view.model.cid) options.index = index;

      items.push({
        src: image.get('data'),
        w: image.get('width'),
        h: image.get('height'),
      });
    });

// Initializes and opens PhotoSwipe
    var gallery = new Gallery(items, options);
    gallery.init();
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
});
