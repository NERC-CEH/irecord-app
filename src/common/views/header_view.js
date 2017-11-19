import Marionette from 'backbone.marionette';
import JST from 'JST';

export default Marionette.View.extend({
  tagName: 'nav',
  template: JST['common/header'],

  className() {
    return `common-header ${this.options.classes}`;
  },

  regions: {
    leftPanel: '#left-panel',
    rightPanel: '#right-panel',
    subheader: '#subheader',
  },

  events: {
    'click a[data-rel="back"]': 'navigateBack',
  },

  onRender() {
    if (this.options.rightPanel) {
      this.getRegion('rightPanel').show(this.options.rightPanel);
    }

    if (this.options.subheader) {
      this.getRegion('subheader').show(this.options.subheader);
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
