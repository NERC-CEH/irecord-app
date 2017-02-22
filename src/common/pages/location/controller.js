/** ****************************************************************************
 * Location controller.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import Indicia from 'indicia';
import Log from 'helpers/log';
import Validate from 'helpers/validate';
import StringHelp from 'helpers/string';
import LocHelp from 'helpers/location';
import App from 'app';
import radio from 'radio';

import savedSamples from 'saved_samples';
import appModel from 'app_model';
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
  show(sampleID) {
// wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that, [sampleID]);
      });
      return;
    }

    const sample = savedSamples.get(sampleID);

    // Not found
    if (!sample) {
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (sample.getSyncStatus() === Indicia.SYNCED) {
      radio.trigger('samples:show', sampleID, { replace: true });
      return;
    }

    // MAIN
    const sampleLocation = sample.get('location') || {};
    const active = {};
    if (!sampleLocation.source) {
      active.gps = true;
    } else {
      active[sampleLocation.source] = true;
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
      model: new Backbone.Model({ sample, appModel }),
      vent: App,
    });

    function onLocationSelect(loc, createNew) {
      if (typeof loc !== 'object') {
        // jQuery event object bug fix
        Log('Location:Controller:onLocationSelect: loc is not an object', 'e');
        return;
      }

      let location = loc;
      // we don't need the GPS running and overwriting the selected location
      sample.stopGPS();

      if (!createNew) {
        // extend old location to preserve its previous attributes like name or id
        let oldLocation = sample.get('location');
        if (!_.isObject(oldLocation)) oldLocation = {}; // check for locked true
        location = $.extend(oldLocation, location);
      }

      sample.set('location', location);
      sample.trigger('change:location');
    }

    function onGPSClick() {
      // turn off if running
      if (sample.isGPSRunning()) {
        sample.stopGPS();
      } else {
        sample.startGPS();
      }
    }

    function onLocationNameChange(name) {
      if (!name || typeof name !== 'string') {
        return;
      }

      const location = sample.get('location') || {};
      location.name = StringHelp.escape(name);
      sample.set('location', location);
      sample.trigger('change:location');
    }

    const currentVal = sample.get('location') || {};
    const locationIsLocked = appModel.isAttrLocked('location', currentVal);

    function onPageExit() {
      sample.save()
        .then(() => {
          const attr = 'location';
          let location = sample.get('location') || {};
          const lockedValue = appModel.getAttrLock('location');

          if ((location.latitude && location.longitude) || location.name) {
            // we can lock loaction and name on their own
            // don't lock GPS though, because it varies more than a map or gridref

            // save to past locations
            const locationID = appModel.setLocation(sample.get('location'));
            location.id = locationID;
            sample.set('location', location);

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
        })
        .catch((error) => {
          Log(error, 'e');
          radio.trigger('app:dialog:error', error);
        });
    }

    mainView.on('childview:location:select:past', (location) => {
      onLocationSelect(location, true);
      onPageExit();
    });
    mainView.on('childview:location:delete', (model) => {
      PastLocationsController.deleteLocation(model);
    });
    mainView.on('childview:location:edit', (model) => {
      PastLocationsController.editLocation(model);
    });
    mainView.on('childview:location:select:map', onLocationSelect);
    mainView.on('childview:location:select:gridref', (data) => {
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
        radio.trigger('gridref:form:data:invalid', {}); // update form
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

        onLocationSelect(location);
        onPageExit();
      } else {
        radio.trigger('gridref:form:data:invalid', validationError);
      }
    });
    mainView.on('childview:gps:click', onGPSClick);
    mainView.on('childview:location:name:change', onLocationNameChange);

    radio.trigger('app:main', mainView);

    // HEADER
    const lockView = new LockView({
      model: new Backbone.Model({ appModel, sample }),
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
      model: sample,
    });

    radio.trigger('app:header', headerView);

    // if exit on selection click
    mainView.on('save', onPageExit);


    // FOOTER
    radio.trigger('app:footer:hide');
  },
};

export { API as default };
