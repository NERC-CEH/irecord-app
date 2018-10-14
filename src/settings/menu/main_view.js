/** ****************************************************************************
 * Setting Menu main view.
 **************************************************************************** */
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import JST from 'JST';

export default Marionette.View.extend({
  tagName: 'ion-list',
  attributes: { lines: 'full' },
  template: JST['settings/menu/main'],

  events: {
    'ionChange #use-training-btn': 'onSettingToggled',
    'ionChange #use-gridref-btn': 'useGridRef',
    'ionChange #use-experiments-btn': 'onSettingToggled',
    'ionChange #use-gridmap-btn': 'onSettingToggled',
    'ionChange #use-autosync-btn': 'onSettingToggled'
  },

  triggers: {
    'click #delete-all-btn': 'samples:delete:all',
    'click #submit-all-btn': 'samples:submit:all',
    'click #app-reset-btn': 'app:reset'
  },

  useGridRef(e) {
    this.onSettingToggled(e);

    // toggle the child options
    const appModel = this.model;
    const useGridRef = appModel.get('useGridRef');
    const $element = $('#use-gridmap-btn-parent');
    $element.toggleClass('disabled', !useGridRef);
  },

  onSettingToggled(e) {
    const setting = $(e.currentTarget).prop('value');
    const active = $(e.currentTarget).prop('checked');
    this.trigger('setting:toggled', setting, active);
  },

  serializeData() {
    const appModel = this.model;
    return {
      useTraining: appModel.get('useTraining'),
      useGridRef: appModel.get('useGridRef'),
      useGridMap: appModel.get('useGridMap'),
      useExperiments: appModel.get('useExperiments'),
      autosync: appModel.get('autosync'),
      gridSquareUnit: appModel.get('gridSquareUnit')
    };
  }
});
