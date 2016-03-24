/** ****************************************************************************
 * Record Edit footer view.
 *****************************************************************************/
import Marionette from 'marionette';
import _ from 'lodash';
import Morel from 'morel';
import JST from '../../../JST';
import device from '../../../helpers/device';

const SavedImageView = Marionette.ItemView.extend({
  template: _.template('<span class="delete icon icon-cancel">' +
    '</span><img src="<%- obj.data %>" alt="">'),
  className: 'img',

  events: {
    'click span.delete': 'delete',
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
    'sync:request sync:done sync:error': 'render',
  },

  serializeData() {
    return {
      isSynchronising: this.model.getSyncStatus() === Morel.SYNCHRONISING,
    };
  },

  onShow() {
    const that = this;

    // create android camera/gallery selection
    if (window.cordova && device.isAndroid()) {
      this.$el.find('.img-picker input').remove();

      this.$el.find('.img-picker').on('click', () => {
        that.trigger('photo:selection');
      });
    }
  },
});
