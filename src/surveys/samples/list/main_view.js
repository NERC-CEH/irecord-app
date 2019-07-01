/** ****************************************************************************
 * Surveys Sample List main view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import radio from 'radio';
import _MainView, { SampleView as _SampleView } from '../../list/main_view_old';
import SlidingView from '../../../common/views/sliding_view';
import './styles.scss';
import template from './templates/main.tpl';
import templateSample from './templates/sample.tpl';
import templateNone from './templates/list-none.tpl';

const SampleView = Marionette.View.extend({
  tagName: 'ion-item-sliding',

  template: templateSample,

  triggers: _SampleView.prototype.triggers,

  events: _SampleView.prototype.events,

  modelEvents: _SampleView.prototype.modelEvents,

  remove: _SampleView.prototype.remove,

  serializeData() {
    const sample = this.model;
    const occ = sample.getOccurrence();
    const media = occ.media.length && occ.media.models[0];
    let img = media && media.get('thumbnail');

    if (!img) {
      // backwards compatibility
      img = media && media.getURL();
    }
    const specie = occ.get('taxon') || {};

    // taxon
    const scientificName = specie.scientific_name;

    let commonName =
      specie.found_in_name >= 0 && specie.common_names[specie.found_in_name];

    if (specie.found_in_name === 'common_name') {
      // This is just to be backwards compatible
      // TODO: remove in the next update
      commonName = specie.common_name;
    }
    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};
    const surveylocation = sample.parent.get('location') || {};

    const customLocation = surveylocation.gridref !== location.gridref;

    return {
      surveySampleID: this.options.surveySampleID,
      id: sample.cid,
      isLocating: sample.isGPSRunning(),
      location: customLocation ? locationPrint : null,
      locationName: location.name,
      scientificName,
      commonName,
      status: occ.get('status'),
      comment: occ.get('comment'),
      stage: occ.get('stage'),
      identifiers: occ.get('identifiers'),
      abundance: occ.get('abundance'),
      sensitive: occ.metadata.sensitivity_precision,
      img: img ? `<img src="${img}"/>` : '',
    };
  },

  _swipe: _SampleView.prototype._swipe,
  _swipeEnd: _SampleView.prototype._swipeEnd,
  _swipeHome: _SampleView.prototype._swipeHome,
});

const NoSamplesView = Marionette.View.extend({
  tagName: 'div',
  className: 'empty',
  id: 'empty-message',
  template: templateNone,

  triggers: {
    'click #create-new-btn': 'create',
  },
});

const SmartCollectionView = SlidingView.extend({
  childView: SampleView,
  emptyView: NoSamplesView,

  onAttach() {
    // let the world know when the list is in place
    radio.trigger('surveys:list:show', 'samples');
  },

  childViewOptions() {
    return {
      surveySampleID: this.options.surveySampleID,
    };
  },
});

const MainView = _MainView.extend({
  template,

  /**
   * Need to push the main content down due to the subheader
   * @returns {string}
   */
  className() {
    const surveySample = this.options.surveySample;
    let classes = 'slim ';
    let amount = 1;

    if (surveySample.metadata.training) {
      amount++;
    }

    // eslint-disable-next-line
    classes += amount > 0 ? `band-margin-${amount}` : '';
    return classes;
  },

  onRender() {
    const mainRegion = this.getRegion('body');

    mainRegion.show(
      new SmartCollectionView({
        referenceCollection: this.collection,
        appModel: this.options.appModel,
        scroll: this.options.scroll,
        surveySampleID: this.options.surveySample.cid,
      })
    );
  },
});

export { MainView as default, SampleView };
