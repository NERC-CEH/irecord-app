import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'marionette';
import Hammer from '../../../vendor/hammerjs/js/hammer';
import JST from '../../JST';
import browser from '../../helpers/browser';

let EmptyListView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: _.template('No previous locations'),
});

let PastLocationView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell',

  template: JST['common/past_location'],

  triggers: {
    'click .location': 'location:select',
    'click #delete': 'location:delete',
    'click #edit': 'location:edit'
  },

  serializeData: function () {
    let appModel = this.options.appModel;
    let location = appModel.printLocation(this.model.toJSON());

    return {
      name: this.model.get('name'),
      source: this.model.get('source'),
      location: location,
    }
  },

  onRender: function () {
    //early return
    if (!browser.isMobile()) return;

    this.$record = this.$el.find('.location');
    this.docked = false;
    this.position = 0;

    var options = {
      threshold: 50,
      toolsWidth: 100
    };

    var hammertime = new Hammer(this.el, {direction: Hammer.DIRECTION_HORIZONTAL});
    var that = this;

    //on tap bring back
    this.$record.on('tap click', $.proxy(this._swipeHome, this));

    hammertime.on('pan', function(e) {
      e.preventDefault();
      that._swipe(e, options);
    });
    hammertime.on('panend', function(e) {
      that._swipeEnd(e, options);
    });

  },

  remove: function () {
    //removing the last element leaves emptyView + fading out entry for a moment
    if (this.model.collection.length >= 1) {
      let that = this;
      this.$el.addClass('shrink');
      setTimeout(function () {
        Marionette.ItemView.prototype.remove.call(that);
      }, 300);
    } else {
      Marionette.ItemView.prototype.remove.call(this);
    }
  },

  _swipe: function (e, options) {
    //only swipe if no scroll up
    if (Math.abs(e.deltaY) > 10) return;

    if (this.docked) {
      this.position = -options.toolsWidth + e.deltaX;
    } else {
      this.position = e.deltaX;
    }

    //protection of swipeing right too much
    if (this.position > 0) this.position = 0;

    this.$record.css('transform', 'translateX(' + this.position + 'px)');
  },

  _swipeEnd: function (e, options) {
    //only swipe if no scroll up and is not in the middle
    if (Math.abs(e.deltaY) > 10 && !this.position) return;

    // if (e.deltaX > options.threshold) {
    if ((-options.toolsWidth + e.deltaX) > -options.toolsWidth) {
      //bring back
      this.position = 0;
      this.docked = false;
    } else {
      //open tools
      this.docked = true;
      this.position = -options.toolsWidth;
    }

    this.$record.css('transform', 'translateX(' + this.position + 'px)');
  },

  _swipeHome: function (e) {
    if (this.docked) {
      e.preventDefault();
      this.position = 0;
      this.$record.css('transform', 'translateX(' + this.position + 'px)');
      this.docked = false;
    }
  }
});

export default Marionette.CompositeView.extend({
  template: JST['common/past_locations'],

  childViewContainer: '#user-locations',

  childView: PastLocationView,
  emptyView: EmptyListView,

  initialize: function () {
    let that = this;
    let appModel = this.model;
    let previousLocations = appModel.get('locations');
    this.collection = new Backbone.Collection(previousLocations);

    this.listenTo(appModel, 'change:locations', function () {
      let previousLocations = appModel.get('locations');
      that.collection = new Backbone.Collection(previousLocations);

      that.render();
    });

    this.childViewOptions = {
      appModel: appModel
    }
  }
});
