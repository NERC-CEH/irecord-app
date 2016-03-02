define([
  'app',
  'common/app_model',
  'common/user_model',
  './main_view',
  'common/header_view'
], function (App, appModel, userModel, MainView, HeaderView) {
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
            name: this.$el.find('#name').val().escape()
          };
        },

        onShow: function () {
          let $input = this.$el.find('#name');
          $input.focus();
          if (window.deviceIsAndroid) {
            Keyboard.show();
            $input.focusout(function () {
              Keyboard.hide();
            });
          }
        }
      });

      editView = new EditView({model: location});

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

  return API;
});