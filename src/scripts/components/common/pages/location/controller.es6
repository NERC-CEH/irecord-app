define([
  'morel',
  'gps',
  'app',
  'common/record_manager',
  'common/app_model',
  'common/tabs_layout',
  'common/header_view',
  'common/attr_lock_view',
  './gps_view',
  './map_view',
  './grid_ref_view',
  './past_view',
  'JST'
], function (Morel, GPS, App, recordManager, appModel, TabsLayout, HeaderView, LockView, GpsView, MapView, GridRefView, PastView, JST) {
  let API = {
    show: function (recordID){
      recordManager.get(recordID, function (err, recordModel) {
        //Not found
        if (!recordModel) {
          App.trigger('404:show', {replace: true});
          return;
        }

        //can't edit a saved one - to be removed when record update
        //is possible on the server
        if (recordModel.getSyncStatus() == Morel.SYNCED) {
          App.trigger('records:show', recordID, {replace: true});
          return;
        }

        //MAIN
        let mainView = new TabsLayout({
          tabs: [
            {
              active: true,
              id: 'gps',
              title: 'GPS',
              ContentView: GpsView
            },
            {
              id: 'map',
              title: 'Map',
              ContentView: MapView
            },
            {
              id: 'grid-ref',
              title: 'Grid Ref',
              ContentView: GridRefView
            },
            {
              id: 'past',
              title: 'Past',
              ContentView: PastView
            }
          ],
          model: new Backbone.Model({recordModel: recordModel, appModel: appModel})
        });

        let onLocationSelect = function (view, location) {
          //we don't need the GPS running and overwriting the selected location
          recordModel.stopGPS();

          recordModel.set('location', location);
          recordModel.trigger('change:location');
        };

        let onGPSClick = function () {
          //turn off if running
          if (recordModel.locating >= 0) {
            recordModel.stopGPS();
          } else {
            recordModel.startGPS();
          }
        };

        let onLocationNameChange = function (view, name) {
          let location = recordModel.get('location');
          location.name = name;
          recordModel.set('location', location);
          recordModel.trigger('change:location');
        };

        let currentVal = recordModel.get('location');
        let onPageExit = function () {
          recordModel.save(function () {
            let attr = 'location';
            let location = recordModel.get('location');

            let lockedValue = appModel.getAttrLock(attr);

            if (location) {
              //save to past locations
              appModel.setLocation(recordModel.get('location'));

              //update locked value if attr is locked
              if (lockedValue) {
                if (lockedValue === true ||
                  (lockedValue.latitude == currentVal.latitude &&
                  lockedValue.longitude == currentVal.longitude)) {
                  appModel.setAttrLock(attr, location);
                }
              }
            } else if (lockedValue == true) {
              //reset if no location selected but locked is clicked
              appModel.setAttrLock(attr, null);
            }


            window.history.back();
          });
        };

        mainView.on('childview:location:select:past', function (view, location) {
          onLocationSelect(view, location);
          onPageExit();
        });
        mainView.on('childview:location:delete', API.deleteLocation);
        mainView.on('childview:location:edit', API.editLocation);
        mainView.on('childview:location:select:map', onLocationSelect);
        mainView.on('childview:location:select:gridref', function(view, location) {
          onLocationSelect(view, location);
          onPageExit();
        });
        mainView.on('childview:gps:click', onGPSClick);
        mainView.on('childview:location:name:change', onLocationNameChange);

        App.regions.main.show(mainView);

        //HEADER
        let lockView = new LockView({
          model: new Backbone.Model({appModel: appModel, recordModel: recordModel}),
          attr: 'location',
          onLockClick:function () {
            //invert the lock of the attribute
            //real value will be put on exit
            appModel.setAttrLock('location', !appModel.getAttrLock('location'));
          }
        });

        //header view
        let LocationHeader = HeaderView.extend({
          id: 'location-header',

          /*
           From Marionette docs:
           it is suggested that you avoid re-rendering the entire layoutView unless
           absolutely necessary. Instead, if you are binding the layoutView's template
           to a model and need to update portions of the layoutView, you should listen
           to the model's "change" events and only update the necessary DOM elements.
           */
          modelEvents: {
            'change:location': 'updateTitle'
          },

          updateTitle: function () {
            let title = this.model.printLocation();
            let location = this.model.get('location');

            let $title = this.$el.find('h1');

            $title.html(title);
          },

          serializeData: function () {
            return {
              title: this.model.printLocation()
            }
          }
        });

        let headerView = new LocationHeader({
          onExit: onPageExit,
          rightPanel: lockView,
          model: recordModel
        });

        App.regions.header.show(headerView);

        //if exit on selection click
        mainView.on('save', onPageExit);
      });

      //FOOTER
      App.regions.footer.hide().empty();
    },

    editLocation: function (view, model) {
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
    },

    deleteLocation: function (view, model) {
      let location = model;
      appModel.removeLocation(location);
    }
  };

  return API;
});