/** ****************************************************************************
 * Setting Menu main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'marionette';
import device from '../../../helpers/device';
import JST from '../../../JST';

export default Marionette.ItemView.extend({
  tagName: 'ul',
  className: 'table-view',
  template: JST['settings/menu/main'],

  events: {
    'toggle #use-gridref-btn': 'onSettingToggled',
    'click #use-gridref-btn': 'onSettingToggled',
    'toggle #use-autosync-btn': 'onSettingToggled',
    'click #use-autosync-btn': 'onSettingToggled',
  },

  triggers: {
    'click #delete-all-btn': 'records:delete:all',
    'click #submit-all-btn': 'records:submit:all',
    'click #app-reset-btn': 'app:reset',
  },

  onSettingToggled(e) {
    const setting = $(e.currentTarget).data('setting');
    let active = $(e.currentTarget).hasClass('active');

    if (e.type !== 'toggle' && !device.isMobile()) {
      // device.isMobile() android generates both swipe and click

      active = !active; // invert because it takes time to get the class
      $(e.currentTarget).toggleClass('active', active);
    }

    this.trigger('setting:toggled', setting, active);
  },
});
