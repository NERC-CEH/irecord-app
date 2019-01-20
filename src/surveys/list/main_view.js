/** ****************************************************************************
 * Surveys List main view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import radio from 'radio';
import DateHelp from 'helpers/date';
import _MainView, {
  SampleView as _SampleView
} from './main_view_old';
import SlidingView from '../../common/views/sliding_view';
import './styles.scss';
import templateSample from './templates/sample.tpl';
import templateListNone from './templates/list-none.tpl';
import template from './templates/main.tpl';

const SampleView = Marionette.View.extend({
  tagName: 'ion-item-sliding',

  template: templateSample,

  triggers: _SampleView.prototype.triggers,

  events: _SampleView.prototype.events,

  modelEvents: _SampleView.prototype.modelEvents,

  remove: _SampleView.prototype.remove,

  serializeData() {
    const sample = this.model;
    const date = DateHelp.print(sample.get('date'), true);
    const media = sample.media.at(0);
    let img = media && media.get('thumbnail');

    if (!img) {
      // backwards compatibility
      img = media && media.getURL();
    }

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    // calculate unique taxa
    const uniqueTaxa = {};
    sample.samples.each(childSample => {
      const occ = childSample.getOccurrence();
      if (occ) {
        const taxon = occ.get('taxon') || {};
        uniqueTaxa[taxon.warehouse_id] = true;
      }
    });

    return {
      surveyLabel: 'Plant',
      id: sample.cid,
      saved: sample.metadata.saved,
      onDatabase: sample.metadata.synced_on,
      isLocating: sample.isGPSRunning(),
      location: locationPrint,
      locationName: location.name,
      samples: Object.keys(uniqueTaxa).length,
      comment: sample.get('comment'),
      isSynchronising: sample.remote.synchronising,
      date,
      img: img ? `<img src="${img}"/>` : ''
    };
  }
});

const NoSamplesView = Marionette.View.extend({
  tagName: 'div',
  className: 'empty',
  id: 'empty-message',
  template: templateListNone,

  triggers: {
    'click #create-new-btn': 'create'
  }
});

const SmartCollectionView = SlidingView.extend({
  childView: SampleView,
  emptyView: NoSamplesView,

  onAttach() {
    // let the world know when the list is in place
    radio.trigger('surveys:list:show');
  }
});

const MainView = _MainView.extend({
  template,

  regions: {
    body: {
      el: '#list',
      replaceElement: true
    }
  },

  /**
   * Need to push the main content down due to the subheader
   * @returns {string}
   */
  className() {
    let classes = '';
    let amount = 1;

    if (this.options.appModel.get('useTraining')) {
      amount++;
    }

    // eslint-disable-next-line
    classes += amount > 0 ? `band-margin-${amount}` : '';
    return classes;
  },

  onRender() {
    this.showChildView(
      'body',
      new SmartCollectionView({
        referenceCollection: this.collection,
        appModel: this.options.appModel,
        scroll: this.options.scroll
      })
    );
  }
});

export default MainView;
