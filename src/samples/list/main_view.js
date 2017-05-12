/** ****************************************************************************
 * Sample List main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import Hammer from 'hammerjs';
import Log from 'helpers/log';
import StringHelp from 'helpers/string';
import Device from 'helpers/device';
import DateHelp from 'helpers/date';
import JST from 'JST';
import Gallery from '../../common/gallery';
import LoaderView from '../../common/views/loader_view';
import './styles.scss';

const SampleView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell swipe',

  template: JST['samples/list/sample'],

  triggers: {
    'click #delete': 'sample:delete',
    'click #add-species-btn': 'taxon:add',
  },

  events: {
    // need to pass the attribute therefore 'triggers' method does not suit
    'click .js-attr': (e) => {
      e.preventDefault();
      this.trigger('sample:edit:attr', $(e.target).data('attr'));
    },
    'click img': 'photoView',
  },

  modelEvents: {
    'request sync error': 'render',
    geolocation: 'render',
  },

  photoView(e) {
    e.preventDefault();

    const items = [];

    this.model.getOccurrence().media.each((image) => {
      items.push({
        src: image.getURL(),
        w: image.get('width') || 800,
        h: image.get('height') || 800,
      });
    });

    // Initializes and opens PhotoSwipe
    const gallery = new Gallery(items);
    gallery.init();
  },

  onRender() {
    // add mobile swipe events
    // early return
    if (!Device.isMobile()) return;

    this.$sample = this.$el.find('a');
    this.docked = false;
    this.position = 0;

    const options = {
      threshold: 50,
      toolsWidth: 100,
    };

    const hammertime = new Hammer(this.el, { direction: Hammer.DIRECTION_HORIZONTAL });
    const that = this;

    // on tap bring back
    this.$sample.on('tap click', $.proxy(this._swipeHome, this));

    hammertime.on('pan', (e) => {
      e.preventDefault();
      that._swipe(e, options);
    });
    hammertime.on('panend', (e) => {
      that._swipeEnd(e, options);
    });
  },

  remove() {
    Log('Samples:MainView: removing a sample.');
    // removing the last element leaves emptyView + fading out entry for a moment
    if (this.model.collection && this.model.collection.length >= 1) {
      const that = this;
      this.$el.addClass('shrink');
      setTimeout(() => {
        Marionette.View.prototype.remove.call(that);
      }, 300);
    } else {
      Marionette.View.prototype.remove.call(this);
    }
  },

  serializeData() {
    const sample = this.model;
    const occ = sample.getOccurrence();
    const date = DateHelp.print(sample.get('date'), true);
    const specie = occ.get('taxon') || {};
    const media = occ.media;
    let img = media.length && media.at(0).get('thumbnail');

    if (!img) {
      // backwards compatibility
      img = media.length && media.at(0).getURL();
    }

    const taxon = specie[specie.found_in_name];

    const syncStatus = this.model.getSyncStatus();

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    let number = occ.get('number') && StringHelp.limit(occ.get('number'));
    if (!number) {
      number = occ.get('number-ranges') && StringHelp.limit(occ.get('number-ranges'));
    }

    const group = sample.get('group');

    return {
      id: sample.cid,
      saved: sample.metadata.saved,
      training: occ.metadata.training,
      onDatabase: syncStatus === Indicia.SYNCED,
      isLocating: sample.isGPSRunning(),
      location: locationPrint,
      locationName: location.name,
      isSynchronising: syncStatus === Indicia.SYNCHRONISING,
      date,
      taxon,
      number,
      stage: occ.get('stage') && StringHelp.limit(occ.get('stage')),
      comment: occ.get('comment'),
      group,
      img: img ? `<img src="${img}"/>` : '',
    };
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

    this.$sample.css('transform', `translateX(${this.position}px)`);
  },

  _swipeEnd(e, options) {
    // only swipe if no scroll up and is not in the middle
    if (Math.abs(e.deltaY) > 10 && !this.position) return;

    if ((-options.toolsWidth + e.deltaX) > -options.toolsWidth) {
      // bring back
      this.position = 0;
      this.docked = false;
    } else {
      // open tools
      this.docked = true;
      this.position = -options.toolsWidth;
    }

    this.$sample.css('transform', `translateX(${this.position}px)`);
  },

  _swipeHome(e) {
    if (this.docked) {
      e.preventDefault();
      this.position = 0;
      this.$sample.css('transform', `translateX(${this.position}px)`);
      this.docked = false;
    }
  },
});

const NoSamplesView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: JST['samples/list/list-none'],

  triggers: {
    'click #create-new-btn': 'create',
  },
});

const MainView = Marionette.CompositeView.extend({
  id: 'samples-list-container',
  template: JST['samples/list/main'],

  childViewContainer: '#list',
  childView: SampleView,

  NoSamplesView,

  constructor(...args) {
    const that = this;
    const [options] = args;
    if (options.collection.fetching) {
      this.emptyView = LoaderView;

      // todo move to controller
      options.collection.once('fetching:done', () => {
        that.emptyView = this.NoSamplesView;
        // when the collection for the view is "reset",
        // the view will call render on itself
        if (!that.collection.length) {
          if (that._isRendered) {
            Log('Samples:MainView: showing empty view.');
            that.render();
          } else if (that._isRendering) {
            Log('Samples:MainView: waiting for current rendering to finish.');
            that.once('render', () => {
              Log('Samples:MainView: showing empty view.');
              that.render();
            });
          }
        }
      });
    } else {
      this.emptyView = this.NoSamplesView;
    }

    Marionette.CompositeView.prototype.constructor.apply(this, args);
  },

  // invert the order
  attachHtml(collectionView, childView) {
    collectionView.$el.find(this.childViewContainer).prepend(childView.el);
  },

  childViewOptions() {
    return {
      appModel: this.options.appModel,
    };
  },

  serializeData() {
    const activity = this.options.appModel.getAttrLock('activity') || {};
    return {
      useTraining: this.options.appModel.get('useTraining'),
      activity: activity.title,
    };
  },
});

export { MainView as default, SampleView };
