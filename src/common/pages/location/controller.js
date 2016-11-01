/** ****************************************************************************
 * Location controller.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import Morel from 'morel';
import { Log, Validate, StringHelp, LocHelp } from 'helpers';
import App from 'app';

import recordManager from '../../record_manager';
import appModel from '../../models/app_model';
import TabsLayout from '../../views/tabs_layout';
import HeaderView from '../../views/header_view';
import LockView from '../../views/attr_lock_view';
import PastLocationsController from '../../../settings/locations/controller';

import GpsView from './gps_view';
import MapView from './map_view';
import GridRefView from './grid_ref_view';
import PastView from './past_view';
import './styles.scss';

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
      const recordLocation = recordModel.get('location') || {};
      const active = {};
      if (!recordLocation.source) {
        active.gps = true;
      } else {
        active[recordLocation.source] = true;
      }
      const mainView = new TabsLayout({
        tabs: [
          {
            active: active.gps,
            id: 'gps',
            title: '<span class="icon icon-location"></span>',
            ContentView: GpsView,
          },
          {
            active: active.map,
            id: 'map',
            title: '<span class="icon icon-map"></span>',
            ContentView: MapView,
          },
          {
            active: active.gridref,
            id: 'grid-ref',
            title: 'GR',
            ContentView: GridRefView,
          },
          {
            id: 'past',
            title: '<span class="icon icon-clock"></span>',
            ContentView: PastView,
          },
        ],
        model: new Backbone.Model({ recordModel, appModel }),
        vent: App,
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
          let oldLocation = recordModel.get('location');
          if (!_.isObject(oldLocation)) oldLocation = {}; // check for locked true
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
        if (!name || typeof name !== 'string') {
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
          error: (error) => {
            Log(error, 'e');
            App.regions.getRegion('dialog').error(error);
          },
        });
      }

      mainView.on('childview:location:select:past', (view, location) => {
        onLocationSelect(view, location, true);
        onPageExit();
      });
      mainView.on('childview:location:delete', (view, model) => {
        PastLocationsController.deleteLocation(model);
      });
      mainView.on('childview:location:edit', (view, model) => {
        PastLocationsController.editLocation(model);
      });
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

          if (!_.isEmpty(errors)) {
            return errors;
          }

          return null;
        }

        const validationError = validate(data);
        if (!validationError) {
          App.trigger('gridref:form:data:invalid', {}); // update form
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
          App.trigger('gridref:form:data:invalid', validationError);
        }
      });
      mainView.on('childview:gps:click', onGPSClick);
      mainView.on('childview:location:name:change', onLocationNameChange);

      App.regions.getRegion('main').show(mainView);

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
         it is suggested that you avoid re-rendering the entire View unless
         absolutely necessary. Instead, if you are binding the View's template
         to a model and need to update portions of the View, you should listen
         to the model's "change" events and only update the necessary DOM elements.
         */
        modelEvents: {
          'change:location': 'updateTitle',
        },

        updateTitle() {
          const title = this.model.printLocation();
          const $title = this.$el.find('h1');

          $title.html(title || 'Location');
        },

        serializeData() {
          return {
            title: this.model.printLocation() || 'Location',
          };
        },
      });

      const headerView = new LocationHeader({
        onExit: onPageExit,
        rightPanel: lockView,
        model: recordModel,
      });

      App.regions.getRegion('header').show(headerView);

      // if exit on selection click
      mainView.on('save', onPageExit);
    });

    // FOOTER
    App.regions.getRegion('footer').hide().empty();
  },
};

export { API as default };
