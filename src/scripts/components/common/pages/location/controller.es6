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
  './past_view'
], function (Morel, GPS, App, recordManager, appModel, TabsLayout, HeaderView, LockView, GpsView, MapView, GridRefView, PastView) {
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

        let onPastLocationDelete = function (view) {
          let location = view.model;
          appModel.removeLocation(location);
        };

        let onGPSClick = function () {
          //turn off if running
          if (recordModel.locating >= 0) {
            recordModel.stopGPS();
          } else {
            recordModel.startGPS();
          }
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

        mainView.on('childview:childview:location:select:past', function (e, view, location) {
          onLocationSelect(view, location);
          onPageExit();
        });
        mainView.on('childview:location:select:past', onLocationSelect);
        mainView.on('childview:location:delete', onPastLocationDelete);
        mainView.on('childview:location:select:map', onLocationSelect);
        mainView.on('childview:location:select:gridref', function(view, location) {
          onLocationSelect(view, location);
          onPageExit();
        });
        mainView.on('childview:gps:click', onGPSClick);

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

        App.regions.header.show(headerView);

        //if exit on selection click
        mainView.on('save', onPageExit);
      });

      //FOOTER
      App.regions.footer.hide().empty();
    }
  };

  return API;
});