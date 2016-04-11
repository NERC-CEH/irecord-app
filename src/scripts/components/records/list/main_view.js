/** ****************************************************************************
 * Record List main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'marionette';
import Morel from 'morel';
import Hammer from '../../../../vendor/hammerjs/js/hammer';
import log from '../../../helpers/log';
import device from '../../../helpers/device';
import dateHelp from '../../../helpers/date';
import stringHelp from '../../../helpers/string';
import JST from '../../../JST';


const RecordView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell',

  triggers: {
    'click #delete': 'record:delete',
  },

  events: {
    // need to pass the attribute therefore 'triggers' method does not suit
    'click .js-attr'(e) {
      e.preventDefault();
      this.trigger('record:edit:attr', $(e.target).data('attr'));
    },
  },

  modelEvents: {
    'request sync error': 'render',
    geolocation: 'render',
  },

  initialize() {
    this.template = JST[`records/list/record${(device.isMobile() ? '_mobile' : '')}`];
  },

  onRender() {
    log('Records:List:MainView: rendering a record');

    // add mobile swipe events
    // early return
    if (!device.isMobile()) return;

    this.$record = this.$el.find('a');
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
    log('Records:MainView: removing a record');
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

  serializeData() {
    const recordModel = this.model;
    const occ = recordModel.occurrences.at(0);
    const date = dateHelp.print(recordModel.get('date'));
    const specie = occ.get('taxon') || {};
    const images = occ.images;
    let img = images.length && images.at(0).get('thumbnail');

    if (!img) {
      //backwards compatibility
      img = images.length && images.at(0).get('data');
    }

    const taxon = specie[specie.found_in_name];

    const syncStatus = this.model.getSyncStatus();

    const locationPrint = recordModel.printLocation();
    const location = recordModel.get('location') || {};

    return {
      id: recordModel.id || recordModel.cid,
      saved: recordModel.metadata.saved,
      onDatabase: syncStatus === Morel.SYNCED,
      isLocating: recordModel.isGPSRunning(),
      location: locationPrint,
      location_name: location.name,
      isSynchronising: syncStatus === Morel.SYNCHRONISING,
      date,
      taxon,
      number: occ.get('number') && stringHelp.limit(occ.get('number')),
      stage: occ.get('stage') && stringHelp.limit(occ.get('stage')),
      comment: occ.get('comment'),
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

    this.$record.css('transform', `translateX(${this.position}px)`);
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

const NoRecordsView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: JST['records/list/list-none'],
});

export default Marionette.CollectionView.extend({
  id: 'records-list',
  tagName: 'ul',
  className: 'table-view no-top',
  emptyView: NoRecordsView,
  childView: RecordView,

  // inverse the collection
  attachHtml(collectionView, childView) {
    collectionView.$el.prepend(childView.el);
  },

  childViewOptions() {
    return {
      appModel: this.options.appModel,
    };
  },
});
