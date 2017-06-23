/** ****************************************************************************
 * Surveys List main view.
 *****************************************************************************/
import $ from 'jquery';
import Indicia from 'indicia';
import _ from 'lodash';
import Marionette from 'backbone.marionette';
import radio from 'radio';
import JST from 'JST';
import DateHelp from 'helpers/date';
import Device from 'helpers/device';
import Gallery from '../../common/gallery';
import _MainView, { SampleView as _SampleView } from '../../samples/list/main_view';
import SlidingView from '../../common/views/sliding_view';
import gridAlertService from './gridAlertService';
import './styles.scss';

const SampleView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell swipe',

  template: JST['surveys/list/sample'],

  triggers: _SampleView.prototype.triggers,

  events: _SampleView.prototype.events,

  modelEvents: _SampleView.prototype.modelEvents,

  photoView(e) {
    e.preventDefault();

    const items = [];

    this.model.media.each((image) => {
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

  onRender: _SampleView.prototype.onRender,
  remove: _SampleView.prototype.remove,

  serializeData() {
    const sample = this.model;
    const date = DateHelp.print(sample.get('date'), true);
    const media = sample.media;
    let img = media.length && media.at(0).get('thumbnail');

    if (!img) {
      // backwards compatibility
      img = media.length && media.at(0).getURL();
    }

    const syncStatus = this.model.getSyncStatus();

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    return {
      surveyLabel: 'Plant',
      id: sample.cid,
      saved: sample.metadata.saved,
      training: sample.metadata.training,
      onDatabase: syncStatus === Indicia.SYNCED,
      isLocating: sample.isGPSRunning(),
      location: locationPrint,
      locationName: location.name,
      samples: sample.samples.length,
      comment: sample.get('comment'),
      isSynchronising: syncStatus === Indicia.SYNCHRONISING,
      date,
      img: img ? `<img src="${img}"/>` : '',
    };
  },

  _swipe: _SampleView.prototype._swipe,
  _swipeEnd: _SampleView.prototype._swipeEnd,
  _swipeHome: _SampleView.prototype._swipeHome,
});

const NoSamplesView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: JST['surveys/list/list-none'],

  triggers: {
    'click #create-new-btn': 'create',
  },
});


const SmartCollectionView = SlidingView.extend({
  childView: SampleView,
  emptyView: NoSamplesView,

  onAttach() {
    // let the world know when the list is in place
    radio.trigger('surveys:list:show');
  },
});


const MainView = _MainView.extend({
  template: JST['surveys/list/main'],

  regions: {
    body: {
      el: '#list',
      replaceElement: true,
    },
    toggle: {
      el: '#toggle',
      replaceElement: true,
    },
  },

  onRender() {
    this.showChildView('body', new SmartCollectionView({
      referenceCollection: this.collection,
      appModel: this.options.appModel,
      scroll: this.options.scroll,
    }));

    this.addToggle();
  },

  addToggle() {
    const appModel = this.options.appModel;

    const ToggleView = Marionette.View.extend({
      events: {
        'toggle #use-atlas-btn': 'onSettingToggled',
        // 'click #use-atlas-btn': 'onSettingClicked',
      },

      template: _.template(`
         <div id="atlas-toggle">
          <span id="alert-label"><%- obj.gridSquareUnit %></span>
            <div id="use-atlas-btn" class="toggle on-off <%- obj.locating ? 'active' : '' %>">
              <div class="toggle-handle"></div>
            </div>
          </div>
       `),

      serializeData() {
        const locating = gridAlertService.locating;
        const gridSquareUnit = locating ? appModel.get('gridSquareUnit') : 'Grid Alert';
        return {
          locating,
          gridSquareUnit,
        };
      },

      // onSettingClicked(e) {      },

      onSettingToggled(e) {
        let active = $(e.currentTarget).hasClass('active');

        if (e.type !== 'toggle' && !Device.isMobile()) {
          // Device.isMobile() android generates both swipe and click

          active = !active; // invert because it takes time to get the class
          $(e.currentTarget).toggleClass('active', active);
        }

        this.trigger('toggled', active);
      },
    });

    const toggleView = new ToggleView();
    toggleView.on('toggled', (setting, active) => this.onToggled(setting, active));
    this.showChildView('toggle', toggleView);
  },

  onToggled(setting, active) {
    this.trigger('atlas:toggled', setting, active);
    this.addToggle();
  },

  serializeData() {
    return {
      useTraining: this.options.appModel.get('useTraining'),
    };
  },
});

export default MainView;
