/** ****************************************************************************
 * Surveys List header view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import _ from 'lodash';
import $ from 'jquery';
import gridAlertService from './gridAlertService';
import template from './templates/header.tpl';

export default Marionette.View.extend({
  id: 'surveys-header',
  tagName: 'nav',
  template,

  triggers: {
    'click #surveys-btn': 'surveys',
    'click #add-survey-btn': 'create'
  },

  regions: {
    toggle: {
      el: '#toggle',
      replaceElement: true
    }
  },

  onRender() {
    this.addToggle();
  },

  addToggle() {
    const appModel = this.options.appModel;

    const ToggleView = Marionette.View.extend({
      events: {
        'ionChange #atlas-toggle': 'onSettingToggled',
      },

      template: _.template(`
          <ion-item id="toggle">
            <ion-label><%- obj.gridSquareUnit %></ion-label>
            <ion-toggle slot="end" id="atlas-toggle"
                        value="sensitive-btn"
            <%- obj.locating ? 'checked' : '' %>>
            </ion-toggle>
          </ion-item>
       `),

      serializeData() {
        const locating = gridAlertService.locating;
        const gridSquareUnit = locating
          ? appModel.get('gridSquareUnit')
          : 'Grid Alert';
        return {
          locating,
          gridSquareUnit
        };
      },


      onSettingToggled(e) {
        const active = $(e.currentTarget).prop('checked');
        this.trigger('toggled', active);
      }
    });

    const toggleView = new ToggleView();
    toggleView.on('toggled', (setting, active) =>
      this.onToggled(setting, active)
    );
    this.showChildView('toggle', toggleView);
  },

  onToggled(setting, active) {
    this.trigger('atlas:toggled', setting, active);
    this.addToggle();
  },

  serializeData() {
    const appModel = this.options.appModel;

    return {
      training: appModel.get('useTraining')
    };
  }
});
