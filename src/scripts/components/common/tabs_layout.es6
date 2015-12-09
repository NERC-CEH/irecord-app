define([
  'marionette',
  'JST'
], function (marionette, JST) {
  
  let Tab = marionette.ItemView.extend({
    tagName: 'li',
    template: JST['common/tab'],

    className: function () {
      return this.model.get('active') ? 'active' : '';
    },

    attributes: function () {
      return {
        'data-id': this.model.id
      };
    },

    triggers: {
      'click': 'openTab'
    }
  });

  let Tabs = Marionette.CollectionView.extend({
    tagName: 'ul',
    childView: Tab,

    onAddChild: function (childView) {
      childView.on('openTab', this.tabClicked, this);
    },

    tabClicked: function(e){
      let tabId = e.view.model.id;
      let active = this.collection.find(model => model.get('active'));
      active.set('active', false);
      e.view.model.set('active', true);

      this.render();

      this.trigger("showTab", tabId);
    }
  });

  let TabsLayout = marionette.LayoutView.extend({
    template: JST['common/tabs_container'],

    regions: {
      tabs: '#tabs',
      content: '#content'
    },

    onShow: function() {
      if (!this.options.tabs) {
        return;
      }

      this.tabsCollection = new Backbone.Collection(this.options.tabs);
      let tabsCollectionView = new Tabs({
        collection: this.tabsCollection
      });
      this.tabs.show(tabsCollectionView);

      tabsCollectionView.on('showTab', this._showContent, this);

      this._showContent();
    },
    
    _showContent: function (tabID) {
      let tab;
      if (!tabID) {
        tab = this.options.tabs.filter(tab => tab.active)[0];
      } else {
        tab = this.options.tabs.filter(tab => tab.id === tabID)[0];
      }
      let contentView = new tab.ContentView();
      this.content.show(contentView);
    }

  });

  return TabsLayout;
});