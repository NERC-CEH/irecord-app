/** ****************************************************************************
 * Surveys List main view.
 *****************************************************************************/
import Indicia from 'indicia';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import DateHelp from 'helpers/date';
import Gallery from '../../common/gallery';
import { default as _MainView, SampleView as _SampleView } from '../../samples/list/main_view';
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
      id: sample.cid,
      saved: sample.metadata.saved,
      training: sample.metadata.training,
      onDatabase: syncStatus === Indicia.SYNCED,
      isLocating: sample.isGPSRunning(),
      location: locationPrint,
      location_name: location.name,
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
});

const MainView = _MainView.extend({
  template: JST['surveys/list/main'],

  childView: SampleView,
  NoSamplesView,
});

export default MainView;
