/** ****************************************************************************
 * Sample List main view.
 **************************************************************************** */
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import radio from 'radio';
import Log from 'helpers/log';
import SlidingView from '../../common/views/sliding_view';
import './styles.scss';
import template from './templates/main.tpl';
import templateSample from './templates/sample.tpl';
import templateNone from './templates/list-none.tpl';

const SampleView = Marionette.View.extend({
  tagName: 'ion-item-sliding',

  template: templateSample,

  triggers: {
    'click #delete': 'sample:delete',
    'click #plus': 'sample:abundance:plus',
    'click #minus': 'sample:abundance:minus',
    'click #add-species-btn': 'taxon:add'
  },

  events: {
    // need to pass the attribute therefore 'triggers' method does not suit
    'click .js-attr': e => {
      e.preventDefault();
      this.trigger('sample:edit:attr', $(e.target).data('attr'));
    }
  },

  modelEvents: {
    'request:remote sync:remote error:remote': 'render',
    geolocation: 'render'
  },

  remove() {
    Log('Samples:MainView: removing a sample.');
    // removing the last element leaves emptyView + fading out entry for a moment
    if (this.model.collection && this.model.collection.length >= 1) {
      this.$el.addClass('shrink');
      setTimeout(() => {
        Marionette.View.prototype.remove.call(this);
      }, 300);
    } else {
      Marionette.View.prototype.remove.call(this);
    }
  },

  serializeData() {

  }
});

const NoSamplesView = Marionette.View.extend({
  tagName: 'div',
  className: 'empty',
  id: 'empty-message',
  template: templateNone,

  triggers: {
    'click #create-new-btn': 'create'
  }
});

const SmartCollectionView = SlidingView.extend({
  childView: SampleView,
  emptyView: NoSamplesView,

  onAttach() {
    // let the world know when the list is in place
    radio.trigger('species:list:show');
  }
});

const MainView = Marionette.View.extend({
  id: 'samples-list-container',
  template,

  /**
   * Need to push the main content down due to the subheader
   * @returns {string}
   */
  className() {
    let classes = '';
    let amount = 0;

    const activity = this.options.appModel.getAttrLock('smp:activity') || {};
    if (activity.title) {
      amount++;
    }

    if (this.options.appModel.get('useTraining')) {
      amount++;
    }

    // eslint-disable-next-line
    classes += amount > 0 ? `band-margin-${amount}` : '';
    return classes;
  },

  regions: {
    body: {
      el: '#list',
      replaceElement: true
    },
    recommendation: {
      el: '#recommendation'
    }
  },

  childViewEvents: {
    // eslint-disable-next-line
    'recommendation:done': function() {
      this.removeRegion('recommendation');
    }
  },

  onRender() {
    const mainRegion = this.getRegion('body');

    mainRegion.show(
      new SmartCollectionView({
        referenceCollection: this.collection,
        appModel: this.options.appModel,
        scroll: this.options.scroll
      })
    );

  },

  shouldAskForFeedback() {
    const appModel = this.options.appModel;
    const userModel = this.options.userModel;
    if (appModel.get('feedbackGiven')) {
      return false;
    }

    if (appModel.get('useTraining')) {
      return false;
    }

    if (!userModel.hasLogIn()) {
      return false;
    }

    return this.collection.length > 10;
  }
});

export { MainView as default, SampleView };
