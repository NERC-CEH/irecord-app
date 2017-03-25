/** ****************************************************************************
 * Sample Edit footer view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import _ from 'lodash';
import Indicia from 'indicia';
import Log from 'helpers/log';
import JST from 'JST';
import Gallery from '../../common/gallery';

const SavedImageView = Marionette.View.extend({
  template: _.template('<span class="delete icon icon-cancel">' +
    '</span><img src="<%- obj.data %>" alt="">'),
  className: 'img',

  events: {
    'click span.delete': 'delete',
    'click img': 'photoView',
  },

  photoView() {
    this.trigger('photo:view', this);
  },

  delete() {
    this.trigger('photo:delete', this.model);
  },

  serializeData() {
    return {
      data: this.model.get('thumbnail'),
    };
  },
});

const EmptyView = Marionette.View.extend({
  template: JST['samples/edit/image_picker_empty'],
  tagName: 'span',
  className: 'empty',
});

export default Marionette.CompositeView.extend({
  id: 'edit-footer',
  template: JST['samples/edit/image_picker_array'],
  initialize() {
    this.collection = this.model.getOccurrence().media;
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
      isSynchronising: this.model.getSyncStatus() === Indicia.SYNCHRONISING,
    };
  },

  onChildviewPhotoView(view) {
    Log('Samples:Edit:Footer: photo view.');

    const items = [];
    const options = {};

    this.collection.each((image, index) => {
      if (image.cid === view.model.cid) options.index = index;

      items.push({
        src: image.getURL(),
        w: image.get('width') || 800,
        h: image.get('height') || 800,
      });
    });

// Initializes and opens PhotoSwipe
    const gallery = new Gallery(items, options);
    gallery.init();
  },

  onAttach() {
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
