import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import Marionette from 'marionette';
import Hammer from '../../../../vendor/hammerjs/js/hammer';
import JST from '../../../JST';
import Device from '../../../helpers/device';

const EmptyListView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: _.template('No previous locations'),
});

const PastLocationView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell',

  template: JST['common/past_location'],

  triggers: {
    'click .location': 'location:select',
    'click #delete': 'location:delete',
    'click #edit': 'location:edit',
  },

  serializeData() {
    const appModel = this.options.appModel;
    const location = appModel.printLocation(this.model.toJSON());

    return {
      name: this.model.get('name'),
      source: this.model.get('source'),
      location,
    };
  },

  onRender() {
    // early return
    if (!Device.isMobile()) return;

    this.$record = this.$el.find('.location');
    this.docked = false;
    this.position = 0;

    const options = {
      threshold: 50,
      toolsWidth: 100,
    };

    const hammertime = new Hammer(this.el, { direction: Hammer.DIRECTION_HORIZONTAL });
    const that = this;

    // on tap bring back
    this.$record.on('tap click', $.proxy(this._swipeHome, this));

    hammertime.on('pan', (e) => {
      e.preventDefault();
      that._swipe(e, options);
    });
    hammertime.on('panend', (e) => {
      that._swipeEnd(e, options);
    });
  },

  remove() {
    // removing the last element leaves emptyView + fading out entry for a moment
    if (this.model.collection.length >= 1) {
      const that = this;
      this.$el.addClass('shrink');
      setTimeout(() => {
        Marionette.ItemView.prototype.remove.call(that);
      }, 300);
    } else {
      Marionette.ItemView.prototype.remove.call(this);
    }
  },

  _swipe(e, options) {
    // only swipe if no scroll up
    if (Math.abs(e.deltaY) > 10) return;

    if (this.docked) {
      this.position = -options.toolsWidth + e.deltaX;
    } else {
      this.position = e.deltaX;
    }

    // protection of swipeing right too much
    if (this.position > 0) this.position = 0;

    this.$record.css('transform', `translateX(${this.position}px)`);
  },

  _swipeEnd(e, options) {
    // only swipe if no scroll up and is not in the middle
    if (Math.abs(e.deltaY) > 10 && !this.position) return;

    // if (e.deltaX > options.threshold) {
    if ((-options.toolsWidth + e.deltaX) > -options.toolsWidth) {
      // bring back
      this.position = 0;
      this.docked = false;
    } else {
      // open tools
      this.docked = true;
      this.position = -options.toolsWidth;
    }

    this.$record.css('transform', `translateX(${this.position}px)`);
  },

  _swipeHome(e) {
    if (this.docked) {
      e.preventDefault();
      this.position = 0;
      this.$record.css('transform', `translateX(${this.position}px)`);
      this.docked = false;
    }
  },
});

export default Marionette.CompositeView.extend({
  template: JST['common/past_locations'],

  childViewContainer: '#user-locations',

  childView: PastLocationView,
  emptyView: EmptyListView,

  initialize() {
    const that = this;
    const appModel = this.model;
    const previousLocations = appModel.get('locations');
    this.collection = new Backbone.Collection(previousLocations);

    this.listenTo(appModel, 'change:locations', () => {
      const prevLoc = appModel.get('locations');
      that.collection = new Backbone.Collection(prevLoc);
      that.render();
    });

    this.childViewOptions = {
      appModel,
    };
  },
});
