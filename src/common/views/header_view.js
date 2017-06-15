import Marionette from 'backbone.marionette';
import JST from 'JST';

export default Marionette.View.extend({
  id: 'common-header',
  tagName: 'nav',
  template: JST['common/header'],

  className() {
    return this.options.classes;
  },

  regions: {
    leftPanel: '#left-panel',
    rightPanel: '#right-panel',
  },

  events: {
    'click a[data-rel="back"]': 'navigateBack',
  },

  onRender() {
    if (this.options.rightPanel) {
      this.getRegion('rightPanel').show(this.options.rightPanel);
    }
  },

  navigateBack() {
    if (this.options.onExit) {
      this.options.onExit();
    } else {
      window.history.back();
    }
  },
});

