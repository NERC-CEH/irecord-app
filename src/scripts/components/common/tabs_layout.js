import Backbone from 'backbone';
import Marionette from 'marionette';
import JST from '../../JST';

const Tab = Marionette.ItemView.extend({
  tagName: 'li',
  template: JST['common/tab'],

  className() {
    return this.model.get('active') ? 'active' : '';
  },

  attributes() {
    return {
      'data-id': this.model.id,
    };
  },

  triggers: {
    click: 'openTab',
  },
});

const Tabs = Marionette.CollectionView.extend({
  tagName: 'ul',
  childView: Tab,

  onAddChild(childView) {
    childView.on('openTab', this.tabClicked, this);
  },

  tabClicked(e) {
    const tabId = e.view.model.id;
    const active = this.collection.find(model => model.get('active'));
    active.set('active', false);
    e.view.model.set('active', true);

    this.render();

    this.trigger('showTab', tabId);
  },
});

export default Marionette.LayoutView.extend({
  template: JST['common/tabs_container'],

  regions: {
    tabs: '#tabs',
    content: '#content',
  },

  childViewOptions() {
    return {
      vent: this.options.vent,
    };
  },

  onShow() {
    if (!this.options.tabs) {
      return;
    }

    this.tabsCollection = new Backbone.Collection(this.options.tabs);
    const tabsCollectionView = new Tabs({
      collection: this.tabsCollection,
    });
    this.tabs.show(tabsCollectionView);

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
      vent: this.options.vent,
    });
    this.content.show(contentView);
  },
});
