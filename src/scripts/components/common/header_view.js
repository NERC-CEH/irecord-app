import Marionette from '../../../vendor/marionette/js/backbone.marionette';
import JST from '../../JST';

export default Marionette.LayoutView.extend({
    id: 'common-header',
    tagName: 'nav',
    template: JST['common/header'],

    regions: {
      leftPanel: '#left-panel',
      rightPanel: '#right-panel'
    },

    events: {
      'click a[data-rel="back"]': "navigateBack"
    },

    onRender: function () {
      if (this.options.rightPanel) {
        this.rightPanel.show(this.options.rightPanel);
      }
    },

    navigateBack: function () {
      if (this.options.onExit) {
        this.options.onExit();
      } else {
        window.history.back();
      }
    }
  });

