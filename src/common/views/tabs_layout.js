import Backbone from 'backbone';
import _ from 'lodash';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import '../styles/tabs.scss';

const Tab = Marionette.View.extend({
  tagName: 'li',
  template: _.template('<%= obj.title %>'),

  className() {
    return this.model.get('active') ? 'active' : '';
  },

  attributes() {
    return {
      'data-id': this.model.id
    };
  },

  triggers: {
    click: 'open:tab'
  }
});

const Tabs = Marionette.CollectionView.extend({
  tagName: 'ul',
  childView: Tab,

  onChildviewOpenTab(view) {
    const tabId = view.model.id;
    const active = this.collection.find(model => model.get('active'));
    active.set('active', false);
    view.model.set('active', true);

    this.render();

    this.trigger('showTab', tabId);
  }
});

export default Marionette.View.extend({
  template: JST['common/tabs_container'],

  className: 'tabs-container',

  regions: {
    tabs: '.tabs',
    content: '.content'
  },

  childViewOptions() {
    return {
      vent: this.options.vent
    };
  },

  onAttach() {
    if (!this.options.tabs) {
      return;
    }

    this.tabsCollection = new Backbone.Collection(this.options.tabs);
    const tabsCollectionView = new Tabs({
      collection: this.tabsCollection
    });
    this.getRegion('tabs').show(tabsCollectionView);

    tabsCollectionView.on('showTab', this._showContent, this);

    this._showContent();
  },

  _showContent(tabID) {
    let tab;
    if (!tabID) {
      tab = this.options.tabs.filter(optionsTab => optionsTab.active)[0];
    } else {
      tab = this.options.tabs.filter(optionsTab => optionsTab.id === tabID)[0];
    }
    const contentView = new tab.ContentView({
      model: this.model,
      vent: this.options.vent
    });
    this.getRegion('content').show(contentView);
  }
});
