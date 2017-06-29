/** ****************************************************************************
 * Surveys List header view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import _ from 'lodash';
import $ from 'jquery';
import JST from 'JST';
import Device from 'helpers/device';
import gridAlertService from './gridAlertService';


export default Marionette.View.extend({
  id: 'surveys-header',
  tagName: 'nav',
  template: JST['surveys/list/header'],

  triggers: {
    'click #surveys-btn': 'surveys',
    'click #create-new-btn': 'create',
  },

  regions: {
    toggle: {
      el: '#toggle',
      replaceElement: true,
    },
  },

  onRender() {
    this.addToggle();
  },

  addToggle() {
    const appModel = this.options.appModel;

    const ToggleView = Marionette.View.extend({
      events: {
        'toggle #use-atlas-btn': 'onSettingToggled',
        // 'click #use-atlas-btn': 'onSettingClicked',
      },

      template: _.template(`
         <div id="atlas-toggle">
          <span id="alert-label"><%- obj.gridSquareUnit %></span>
            <div id="use-atlas-btn" class="toggle on-off <%- obj.locating ? 'active' : '' %>">
              <div class="toggle-handle"></div>
            </div>
          </div>
       `),

      serializeData() {
        const locating = gridAlertService.locating;
        const gridSquareUnit = locating ? appModel.get('gridSquareUnit') : 'Grid Alert';
        return {
          locating,
          gridSquareUnit,
        };
      },

      // onSettingClicked(e) {      },

      onSettingToggled(e) {
        let active = $(e.currentTarget).hasClass('active');

        if (e.type !== 'toggle' && !Device.isMobile()) {
          // Device.isMobile() android generates both swipe and click

          active = !active; // invert because it takes time to get the class
          $(e.currentTarget).toggleClass('active', active);
        }

        this.trigger('toggled', active);
      },
    });

    const toggleView = new ToggleView();
    toggleView.on('toggled', (setting, active) => this.onToggled(setting, active));
    this.showChildView('toggle', toggleView);
  },

  onToggled(setting, active) {
    this.trigger('atlas:toggled', setting, active);
    this.addToggle();
  },

  serializeData() {
    const appModel = this.options.appModel;

    return {
      training: appModel.get('useTraining'),
    };
  },
});

