import $ from 'jquery';
import Backbone from 'backbone';
import Morel from 'morel';
import GPS from '../../../../helpers/gps';
import log from '../../../../helpers/log';
import validate from '../../../../helpers/validate';
import locHelp from '../../../../helpers/location';
import App from '../../../../app';
import JST from '../../../../JST';

import recordManager from '../../record_manager';
import appModel from '../../app_model';
import TabsLayout from '../../tabs_layout';
import HeaderView from '../../header_view';
import LockView from '../../attr_lock_view';

import GpsView from './gps_view';
import MapView from './map_view';
import GridRefView from './grid_ref_view';
import PastView from './past_view';

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
        model: new Backbone.Model({recordModel: recordModel, appModel: appModel}),
        vent: App.vent
      });

      let onLocationSelect = function (view, location, createNew) {
        //we don't need the GPS running and overwriting the selected location
        recordModel.stopGPS();

        if (!createNew) {
          //extend old location to preserve its previous attributes like name or id
          let oldLocation = recordModel.get('location') || {};
          location = $.extend(oldLocation, location);
        }

        recordModel.set('location', location);
        recordModel.trigger('change:location');
      };

      let onGPSClick = function () {
        //turn off if running
        if (recordModel.isGPSRunning()) {
          recordModel.stopGPS();
        } else {
          recordModel.startGPS();
        }
      };

      let onLocationNameChange = function (view, name) {
        if (!name) {
          return;
        }

        let location = recordModel.get('location') || {};
        location.name = name.escape();
        recordModel.set('location', location);
        recordModel.trigger('change:location');
      };

      let currentVal = recordModel.get('location') || {};
      let locationIsLocked = appModel.isAttrLocked('location', currentVal);

      let onPageExit = function () {
        recordModel.save(function () {
          let attr = 'location';
          let location = recordModel.get('location') || {};
          let lockedValue = appModel.getAttrLock('location');

          if ((location.latitude && location.longitude) || location.name) {
            //we can lock loaction and name on their own
            //don't lock GPS though, because it varies more than a map or gridref

            //save to past locations
            let locationID = appModel.setLocation(recordModel.get('location'));
            location.id = locationID;
            recordModel.set('location', location);

            //update locked value if attr is locked
            if (lockedValue) {
              //check if previously the value was locked and we are updating
              if (locationIsLocked || lockedValue === true) {

                log('Updating lock', 'd');

                if (location.source === 'gps') {
                  //on GPS don't lock other than name
                  location = {
                    name: location.name
                  };
                }
                appModel.setAttrLock(attr, location);
              }
            }
          } else if (lockedValue == true) {
            //reset if no location or location name selected but locked is clicked
            appModel.setAttrLock(attr, null);
          }

          window.history.back();
        });
      };

      mainView.on('childview:location:select:past', function (view, location) {
        onLocationSelect(view, location, true);
        onPageExit();
      });
      mainView.on('childview:location:delete', API.deleteLocation);
      mainView.on('childview:location:edit', API.editLocation);
      mainView.on('childview:location:select:map', onLocationSelect);
      mainView.on('childview:location:select:gridref', function(view, data) {
        /**
         * Validates the new location
         * @param attrs
         * @returns {{}}
         */
        function validate (attrs) {
          let errors = {};

          if (!attrs.name) {
            errors.name = "can't be blank";
          }

          if (!attrs.gridref) {
            errors.gridref = "can't be blank";
          } else {
            let validGridRef = /^[A-Za-z]{1,2}\d{2}(?:(?:\d{2}){0,4})?$/;
            let gridref = attrs.gridref.replace(/\s/g, '');
            if (!validGridRef.test(gridref)) {
              errors.gridref = 'invalid';
            } else if (!locHelp.grid2coord(gridref)) {
              errors.gridref = 'invalid';
            }
          }

          if( ! _.isEmpty(errors)){
            return errors;
          }
        }

        let validationError = validate(data);
        if (!validationError) {
          App.vent.trigger("gridref:form:data:invalid", {}); //update form
          var latLon = locHelp.grid2coord(data.gridref);
          let location = {
            source: 'gridref',
            name: data.name,
            gridref: data.gridref,
            latitude: parseFloat(latLon.lat.toFixed(8)),
            longitude: parseFloat(latLon.lon.toFixed(8))
          };

          //-2 because of gridref letters, 2 because this is min precision
          let accuracy = (data.gridref.replace(/\s/g, '').length - 2) || 2;
          location.accuracy = accuracy;

          onLocationSelect(view, location);
          onPageExit();
        } else {
          App.vent.trigger("gridref:form:data:invalid", validationError);
        }
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
          name: this.$el.find('#location-name').val().escape()
        };
      },

      onFormDataInvalid: function (errors) {
        var $view = this.$el;
        validate.updateViewFormErrors($view, errors, "#location-");
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
            if (!locationEdit.name) {
              editView.trigger('form:data:invalid', {
                name: 'can\'t be empty'
              });
              return;
            }
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

export { API as default };
