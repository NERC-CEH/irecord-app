define([
  'helpers/gps',
  'app',
  'common/user_model',
  'common/tabs_layout',
  'common/header_view',
  'common/attr_lock_view',
  './gps_view',
  './map_view',
  './grid_ref_view',
  './past_view',
  'common/record_manager'
], function (GPS, app, userModel, TabsLayout, HeaderView, LockView, GpsView, MapView, GridRefView, PastView, recordManager) {
  let API = {
    show: function (recordID){
      recordManager.get(recordID, function (err, recordModel) {
        if (!recordModel) {
          app.trigger('404:show');
          return;
        }

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
          model: new Backbone.Model({record: recordModel, user: userModel})
        });

        let onLocationSelect = function (view, location) {
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

        let onPageExit = function () {
          recordManager.set(recordModel, function () {
            //update locked value if attr is locked
            if (userModel.getAttrLock('location')) {
              userModel.setAttrLock('location', recordModel.get('location'));
            }

            window.history.back();
          });
        };

        mainView.on('childview:location:select:map', onLocationSelect);
        mainView.on('childview:location:select:gridref', function(view, location) {
          onLocationSelect(view, location);
          onPageExit();
        });
        mainView.on('childview:gps:click', onGPSClick);

        app.regions.main.show(mainView);

        //HEADER
        let lockView = new LockView({
          model: userModel,
          attr: 'location',
          onLockClick:function () {
            //invert the lock of the attribute
            //real value will be put on exit
            userModel.setAttrLock('location', !userModel.getAttrLock('location'));
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
            this.$el.find('h1').html(title);
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

        app.regions.header.show(headerView);

        //if exit on selection click
        mainView.on('save', onPageExit);
      });
    }
  };

  return API;
});