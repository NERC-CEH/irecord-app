import Marionette from 'marionette';
import Morel from 'morel';
import JST from '../../../JST';

let SavedImageView = Marionette.ItemView.extend({
  template: _.template('<span class="delete icon icon-cancel"></span><img src="<%- obj.data %>" alt="">'),
  className: 'img',

  events: {
    'click span.delete': 'delete'
  },

  delete: function (e) {
    this.trigger('photo:delete', e);
  },

  serializeData: function () {
    return {
      data: this.model.get('data')
    }
  }
});

let EmptyView = Marionette.ItemView.extend({
  template: JST['records/edit/image_picker_empty'],
  tagName: 'span',
  className: 'empty'
});

export default Marionette.CompositeView.extend({
  id: 'edit-footer',
  template: JST['records/edit/image_picker_array'],
  initialize: function () {
    this.collection = this.model.occurrences.at(0).images;
  },

  events: {
    'change input': 'photoUpload'
  },

  photoUpload: function (e) {
    this.trigger('photo:upload', e);
  },

  childViewContainer: '#img-array',
  childView: SavedImageView,

  emptyView: EmptyView,

  modelEvents: {
    'sync:request sync:done sync:error': 'render'
  },

  serializeData: function () {
    return {
      isSynchronising: this.model.getSyncStatus() == Morel.SYNCHRONISING
    }
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
