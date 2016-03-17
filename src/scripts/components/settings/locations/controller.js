import Backbone from 'backbone';
import Marionette from 'marionette';
import App from '../../../app';
import JST from '../../../JST';
import appModel from '../../common/app_model';
import userModel from '../../common/user_model';
import MainView from './main_view';
import HeaderView from '../../common/header_view';

let API = {
  show: function (id){
    //MAIN
    let mainView = new MainView({
      model: appModel
    });

    mainView.on('location:delete', API.deleteLocation);
    mainView.on('location:edit', API.editLocation);

    App.regions.main.show(mainView);

    //HEADER
    let headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Locations'
      })
    });
    App.regions.header.show(headerView);

    //FOOTER
    App.regions.footer.hide().empty();
  },

  deleteLocation: function (model) {
    let location = model;
    appModel.removeLocation(location);
  },

  editLocation: function (model) {
    let location = model;
    let EditView = Marionette.ItemView.extend({
      template: JST['common/past_location_edit'],
      getValues: function () {
        return {
          name: this.$el.find('#location-name').val().escape(),
        };
      },

      onShow: function () {
        let $input = this.$el.find('#location-name');
        $input.focus();
        if (window.deviceIsAndroid) {
          Keyboard.show();
          $input.focusout(function () {
            Keyboard.hide();
          });
        }
      }
    });

    const editView = new EditView({model: location});

    App.regions.dialog.show({
      title: 'Edit Location',
      body: editView,
      buttons: [
        {
          title: 'Save',
          class: 'btn-positive',
          onClick: function () {
            //update location
            let locationEdit = editView.getValues();
            appModel.setLocation(location.set(locationEdit).toJSON());
            App.regions.dialog.hide();
          }
        },
        {
          title: 'Cancel',
          onClick: function () {
            App.regions.dialog.hide();
          }
        }
      ]
    });
  }
};

export { API as default };
