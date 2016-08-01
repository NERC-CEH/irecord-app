/** ****************************************************************************
 * Location controller.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import Marionette from 'marionette';
import Morel from 'morel';
import Device from '../../../../helpers/device';
import Log from '../../../../helpers/log';
import Validate from '../../../../helpers/validate';
import StringHelp from '../../../../helpers/string';
import LocHelp from '../../../../helpers/location';
import App from '../../../../app';
import JST from '../../../../JST';

import recordManager from '../../record_manager';
import appModel from '../../models/app_model';
import TabsLayout from '../../views/tabs_layout';
import HeaderView from '../../views/header_view';
import LockView from '../../views/attr_lock_view';

import GpsView from './gps_view';
import MapView from './map_view';
import GridRefView from './grid_ref_view';
import PastView from './past_view';

const API = {
  show(recordID) {
    recordManager.get(recordID, (err, recordModel) => {
      // Not found
      if (!recordModel) {
        App.trigger('404:show', { replace: true });
        return;
      }

      // can't edit a saved one - to be removed when record update
      // is possible on the server
      if (recordModel.getSyncStatus() === Morel.SYNCED) {
        App.trigger('records:show', recordID, { replace: true });
        return;
      }

      // MAIN
      const mainView = new TabsLayout({
        tabs: [
          {
            active: true,
            id: 'gps',
            title: 'GPS',
            ContentView: GpsView,
          },
          {
            id: 'map',
            title: 'Map',
            ContentView: MapView,
          },
          {
            id: 'grid-ref',
            title: 'Grid Ref',
            ContentView: GridRefView,
          },
          {
            id: 'past',
            title: 'Past',
            ContentView: PastView,
          },
        ],
        model: new Backbone.Model({ recordModel, appModel }),
        vent: App.vent,
      });

      function onLocationSelect(view, loc, createNew) {
        if (typeof loc !== 'object') {
          // jQuery event object bug fix
          Log('Location:Controller:onLocationSelect: loc is not an object', 'e');
          return;
        }

        let location = loc;
        // we don't need the GPS running and overwriting the selected location
        recordModel.stopGPS();

        if (!createNew) {
          // extend old location to preserve its previous attributes like name or id
          const oldLocation = recordModel.get('location') || {};
          location = $.extend(oldLocation, location);
        }

        recordModel.set('location', location);
        recordModel.trigger('change:location');
      }

      function onGPSClick() {
        // turn off if running
        if (recordModel.isGPSRunning()) {
          recordModel.stopGPS();
        } else {
          recordModel.startGPS();
        }
      }

      function onLocationNameChange(view, name) {
        if (!name) {
          return;
        }

        const location = recordModel.get('location') || {};
        location.name = StringHelp.escape(name);
        recordModel.set('location', location);
        recordModel.trigger('change:location');
      }

      const currentVal = recordModel.get('location') || {};
      const locationIsLocked = appModel.isAttrLocked('location', currentVal);

      function onPageExit() {
        recordModel.save(null, {
          success: () => {
            const attr = 'location';
            let location = recordModel.get('location') || {};
            const lockedValue = appModel.getAttrLock('location');

            if ((location.latitude && location.longitude) || location.name) {
              // we can lock loaction and name on their own
              // don't lock GPS though, because it varies more than a map or gridref

              // save to past locations
              const locationID = appModel.setLocation(recordModel.get('location'));
              location.id = locationID;
              recordModel.set('location', location);

              // update locked value if attr is locked
              if (lockedValue) {
                // check if previously the value was locked and we are updating
                if (locationIsLocked || lockedValue === true) {
                  Log('Updating lock', 'd');

                  if (location.source === 'gps') {
                    // on GPS don't lock other than name
                    location = {
                      name: location.name,
                    };
                  }
                  appModel.setAttrLock(attr, location);
                }
              }
            } else if (lockedValue === true) {
              // reset if no location or location name selected but locked is clicked
              appModel.setAttrLock(attr, null);
            }

            window.history.back();
          },
          error: (err) => {
            Log(err, 'e');
            App.regions.dialog.error(err);
          },
        });
      }

      mainView.on('childview:location:select:past', (view, location) => {
        onLocationSelect(view, location, true);
        onPageExit();
      });
      mainView.on('childview:location:delete', API.deleteLocation);
      mainView.on('childview:location:edit', API.editLocation);
      mainView.on('childview:location:select:map', onLocationSelect);
      mainView.on('childview:location:select:gridref', (view, data) => {
        /**
         * Validates the new location
         * @param attrs
         * @returns {{}}
         */
        function validate(attrs) {
          const errors = {};

          if (!attrs.name) {
            errors.name = "can't be blank";
          }

          if (!attrs.gridref) {
            errors.gridref = "can't be blank";
          } else {
            const gridref = attrs.gridref.replace(/\s/g, '');
            if (!Validate.gridRef(gridref)) {
              errors.gridref = 'invalid';
            } else if (!LocHelp.grid2coord(gridref)) {
              errors.gridref = 'invalid';
            }
          }

          if (! _.isEmpty(errors)) {
            return errors;
          }
        }

        const validationError = validate(data);
        if (!validationError) {
          App.vent.trigger('gridref:form:data:invalid', {}); // update form
          const latLon = LocHelp.grid2coord(data.gridref);
          const location = {
            source: 'gridref',
            name: data.name,
            gridref: data.gridref,
            latitude: parseFloat(latLon.lat.toFixed(8)),
            longitude: parseFloat(latLon.lon.toFixed(8)),
          };

          // -2 because of gridref letters, 2 because this is min precision
          const accuracy = (data.gridref.replace(/\s/g, '').length - 2) || 2;
          location.accuracy = accuracy;

          onLocationSelect(view, location);
          onPageExit();
        } else {
          App.vent.trigger('gridref:form:data:invalid', validationError);
        }
      });
      mainView.on('childview:gps:click', onGPSClick);
      mainView.on('childview:location:name:change', onLocationNameChange);

      App.regions.main.show(mainView);

      // HEADER
      const lockView = new LockView({
        model: new Backbone.Model({ appModel, recordModel }),
        attr: 'location',
        onLockClick() {
          // invert the lock of the attribute
          // real value will be put on exit
          appModel.setAttrLock('location', !appModel.getAttrLock('location'));
        },
      });

      // header view
      const LocationHeader = HeaderView.extend({
        id: 'location-header',

        /*
         From Marionette docs:
         it is suggested that you avoid re-rendering the entire layoutView unless
         absolutely necessary. Instead, if you are binding the layoutView's template
         to a model and need to update portions of the layoutView, you should listen
         to the model's "change" events and only update the necessary DOM elements.
         */
        modelEvents: {
          'change:location': 'updateTitle',
        },

        updateTitle() {
          const title = this.model.printLocation();
          const $title = this.$el.find('h1');

          $title.html(title);
        },

        serializeData() {
          return {
            title: this.model.printLocation(),
          };
        },
      });

      const headerView = new LocationHeader({
        onExit: onPageExit,
        rightPanel: lockView,
        model: recordModel,
      });

      App.regions.header.show(headerView);

      // if exit on selection click
      mainView.on('save', onPageExit);
    });

    // FOOTER
    App.regions.footer.hide().empty();
  },

  editLocation(view, model) {
    const location = model;
    const EditView = Marionette.ItemView.extend({
      template: JST['common/past_location_edit'],
      getValues() {
        return {
          name: StringHelp.escape(this.$el.find('#location-name').val()),
        };
      },

      onFormDataInvalid(errors) {
        const $view = this.$el;
        Validate.updateViewFormErrors($view, errors, '#location-');
      },

      onShow() {
        const $input = this.$el.find('#name');
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

    App.regions.dialog.show({
      title: 'Edit Location',
      body: editView,
      buttons: [
        {
          title: 'Save',
          class: 'btn-positive',
          onClick() {
            // update location
            const locationEdit = editView.getValues();
            if (!locationEdit.name) {
              editView.trigger('form:data:invalid', {
                name: 'can\'t be empty',
              });
              return;
            }
            appModel.setLocation(location.set(locationEdit).toJSON());
            App.regions.dialog.hide();
          },
        },
        {
          title: 'Cancel',
          onClick() {
            App.regions.dialog.hide();
          },
        },
      ],
    });
  },

  deleteLocation(view, model) {
    const location = model;
    appModel.removeLocation(location);
  },
};

export { API as default };
