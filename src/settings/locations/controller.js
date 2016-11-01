/** ****************************************************************************
 * Settings Locations controller.
 *****************************************************************************/
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import App from 'app';
import { Log, StringHelp, Device } from 'helpers';
import JST from 'JST';
import appModel from '../../common/models/app_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    Log('Settings:Locations:Controller: showing');

    // MAIN
    const mainView = new MainView({
      model: appModel,
    });

    mainView.on('location:delete', API.deleteLocation);
    mainView.on('location:edit', API.editLocation);

    App.regions.getRegion('main').show(mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Locations',
      }),
    });
    App.regions.getRegion('header').show(headerView);

    // FOOTER
    App.regions.getRegion('footer').hide().empty();
  },

  deleteLocation(model) {
    Log('Settings:Locations:Controller: deleting location');

    const location = model;
    appModel.removeLocation(location);
  },

  editLocation(model) {
    Log('Settings:Locations:Controller: editing location');

    const location = model;
    const EditView = Marionette.View.extend({
      template: JST['common/past_location_edit'],
      getValues() {
        return {
          name: StringHelp.escape(this.$el.find('#location-name').val()),
          favourite: this.$el.find('#favourite-btn').hasClass('active'),
        };
      },

      onShow() {
        const $input = this.$el.find('#location-name');
        $input.focus();
        if (Device.isAndroid()) {
          window.Keyboard.show();
          $input.focusout(() => {
            window.Keyboard.hide();
          });
        }
      },
    });

    const editView = new EditView({ model: location });

    App.regions.getRegion('dialog').show({
      title: 'Edit Location',
      body: editView,
      buttons: [
        {
          title: 'Save',
          class: 'btn-positive',
          onClick() {
            // update location
            const locationEdit = editView.getValues();
            appModel.setLocation(location.set(locationEdit).toJSON());
            App.regions.getRegion('dialog').hide();
          },
        },
        {
          title: 'Cancel',
          onClick() {
            App.regions.getRegion('dialog').hide();
          },
        },
      ],
    });
  },
};

export { API as default };
