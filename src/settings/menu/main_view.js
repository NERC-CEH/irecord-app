/** ****************************************************************************
 * Setting Menu main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import Device from 'helpers/device';
import JST from 'JST';

export default Marionette.View.extend({
  tagName: 'ul',
  className: 'table-view',
  template: JST['settings/menu/main'],

  events: {
    'toggle #use-training-btn': 'onSettingToggled',
    'click #use-training-btn': 'onSettingToggled',
    'toggle #use-gridref-btn': 'useGridRef',
    'click #use-gridref-btn': 'useGridRef',
    'toggle #use-experiments-btn': 'onSettingToggled',
    'click #use-experiments-btn': 'onSettingToggled',
    'toggle #use-gridmap-btn': 'onSettingToggled',
    'click #use-gridmap-btn': 'onSettingToggled',
    'toggle #use-autosync-btn': 'onSettingToggled',
    'click #use-autosync-btn': 'onSettingToggled',
  },

  triggers: {
    'click #delete-all-btn': 'samples:delete:all',
    'click #submit-all-btn': 'samples:submit:all',
    'click #app-reset-btn': 'app:reset',
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
    const setting = $(e.currentTarget).data('setting');
    let active = $(e.currentTarget).hasClass('active');

    if (e.type !== 'toggle' && !Device.isMobile()) {
      // Device.isMobile() android generates both swipe and click

      active = !active; // invert because it takes time to get the class
      $(e.currentTarget).toggleClass('active', active);
    }

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
      gridSquareUnit: appModel.get('gridSquareUnit'),
    };
  },
});
