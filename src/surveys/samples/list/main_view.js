/** ****************************************************************************
 * Surveys List main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';
import { default as _MainView, SampleView as _SampleView } from '../../../samples/list/main_view';
import './styles.scss';

const SampleView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell swipe',

  template: JST['surveys/samples/list/sample'],

  triggers: _SampleView.prototype.triggers,

  events: _SampleView.prototype.events,

  modelEvents: _SampleView.prototype.modelEvents,

  photoView: _SampleView.prototype.photoView,
  onRender: _SampleView.prototype.onRender,
  remove: _SampleView.prototype.remove,

  serializeData() {
    const sample = this.model;
    const occ = sample.getOccurrence();
    const media = occ.media;
    let img = media.length && media.at(0).get('thumbnail');

    if (!img) {
      // backwards compatibility
      img = media.length && media.at(0).getURL();
    }
    const specie = occ.get('taxon') || {};

    // taxon
    const scientificName = specie.scientific_name;
    const commonName = specie.common_name;

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    return {
      surveySampleID: this.options.surveySampleID,
      id: sample.cid,
      isLocating: sample.isGPSRunning(),
      location: locationPrint,
      locationName: location.name,
      scientificName,
      commonName,
      status: occ.get('status'),
      comment: occ.get('comment'),
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
  template: JST['surveys/samples/list/list-none'],

  triggers: {
    'click #create-new-btn': 'create',
  },
});

const MainView = _MainView.extend({
  template: JST['surveys/samples/list/main'],

  childView: SampleView,
  NoSamplesView,
  serializeData() {},

  childViewOptions() {
    return {
      surveySampleID: this.options.surveySampleID,
    };
  },
});

export { MainView as default, SampleView };
