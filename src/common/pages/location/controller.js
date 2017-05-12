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
import GridRefUtils from 'helpers/gridrefutils';
import App from 'app';
import radio from 'radio';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import MainView from './main_view';
// import PastLocationsController from '../../../settings/locations/controller';
import './styles.scss';

const API = {
  show(sampleID, subSampleID) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that, [sampleID]);
      });
      return;
    }

    let sample = savedSamples.get(sampleID);

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

    if (subSampleID) {
      sample = sample.samples.get(subSampleID);
    }

    // MAIN
    const mainView = new MainView({
      model: new Backbone.Model({ sample, appModel }),
      vent: App,
    });

    // past locations
    mainView.on('past:click', () => API.onPastLocationsClick(sample));

    // map
    mainView.on('location:select:map',
      (loc, createNew) => API.setLocation(sample, loc, createNew)
    );

    // gridref
    mainView.on('location:gridref:change',
      data => API.onManualGridrefChange(sample, data)
    );

    // gps
    mainView.on('gps:click', () => API.onGPSClick(sample));

    // location name
    mainView.on('location:name:change',
      locationName => API.updateLocationName(sample, locationName)
    );

    mainView.on('lock:click:location', API.onLocationLockClick);
    mainView.on('lock:click:name', API.onNameLockClick);

    const location = sample.get('location') || {};
    const locationName = sample.get('locationName');
    const locationIsLocked = appModel.isAttrLocked('location', location);
    const nameIsLocked = appModel.isAttrLocked('locationName', locationName);
    mainView.on('navigateBack', () => {
      API.exit(sample, locationIsLocked, nameIsLocked);
    });

    radio.trigger('app:main', mainView);

    // HEADER
    radio.trigger('app:header:hide');

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  /**
   * Sets new location to sample.
   * @param sample
   * @param loc
   * @param createNew
   */
  setLocation(sample, loc, reset) {
    if (typeof loc !== 'object') {
      // jQuery event object bug fix
      Log('Location:Controller:setLocation: loc is not an object.', 'e');
      return Promise.reject(new Error('Invalid location'));
    }

    let location = loc;
    // we don't need the GPS running and overwriting the selected location
    sample.stopGPS();

    if (!reset) {
      // extend old location to preserve its previous attributes like name or id
      let oldLocation = sample.get('location');
      if (!_.isObject(oldLocation)) oldLocation = {}; // check for locked true
      location = $.extend(oldLocation, location);
    }

    // save to past locations
    const locationID = appModel.setLocation(location);
    location.id = locationID;

    sample.set('location', location);
    sample.trigger('change:location');

    return sample.save()
      .catch((error) => {
        Log(error, 'e');
        radio.trigger('app:dialog:error', error);
      });
  },

  exit(sample, locationWasLocked, nameWasLocked) {
    Log('Location:Controller: exiting.');

    sample.save()
      .then(() => {
        // save to past locations and update location ID on record
        const location = sample.get('location') || {};
        if ((location.latitude && location.longitude)) {
          const locationName = sample.get('locationName');
          const locationID = appModel.setLocation(location, locationName);
          location.id = locationID;
          sample.set('location', location);
        }

        const locationName = sample.get('locationName');
        API.updateLocks(location, locationName, locationWasLocked, nameWasLocked);

        window.history.back();
      })
      .catch((error) => {
        Log(error, 'e');
        radio.trigger('app:dialog:error', error);
      });
  },


  /**
   * Updates the
   * @param sample
   */
  updateLocks(location = {}, locationName, locationWasLocked, nameWasLocked) {
    Log('Location:Controller: updating locks.');

    const currentLock = appModel.getAttrLock('location');
    const currentLockedName = appModel.getAttrLock('locationName');

    // location
    if (location.source !== 'gps' && location.latitude && location.longitude) {
      // we can lock location and name on their own
      // don't lock GPS though, because it varies more than a map or gridref
      if (currentLock &&
        (currentLock === true || locationWasLocked)) {
        // update locked value if attr is locked
        // check if previously the value was locked and we are updating
        Log('Updating lock.');
        appModel.setAttrLock('location', location);
      }
    } else if (currentLock === true) {
      // reset if no location or location name selected but locked is clicked
      appModel.setAttrLock('location', null);
    }

    // name
    if (currentLockedName &&
      (currentLockedName === true || nameWasLocked)) {
      appModel.setAttrLock('locationName', locationName);
    }
  },

  onGPSClick(sample) {
    // turn off if running
    if (sample.isGPSRunning()) {
      sample.stopGPS();
    } else {
      sample.startGPS();
    }
  },

  updateLocationName(sample, locationName) {
    if (!locationName || typeof locationName !== 'string') {
      return;
    }

    const escapedName = StringHelp.escape(locationName);
    sample.set('locationName', escapedName);
    sample.save();
  },

  onManualGridrefChange(sample, gridref) {
    Log('Location:Controller: executing onManualGridrefChange.');
    const normalizedGridref = gridref.replace(/\s/g, '').toUpperCase();

    if (gridref !== '') {
      const parsedGridRef = GridRefUtils.GridRefParser.factory(normalizedGridref);

      if (parsedGridRef) {
        const location = sample.get('location') || {};
        const latLng = parsedGridRef.osRef.to_latLng();

        location.source = 'gridref';
        location.gridref = parsedGridRef.preciseGridRef;
        location.latitude = latLng.lat;
        location.longitude = latLng.lng;
        location.accuracy = parsedGridRef.length / 2; // radius rather than square dimension

        API.setLocation(sample, location);
      } else {
        App.trigger('gridref:form:data:invalid', { gridref: 'invalid' });
      }
    } else {
      const location = sample.get('location') || {};
      location.source = null; // unsure what this should be
      location.gridref = '';
      location.latitude = null;
      location.longitude = null;
      location.accuracy = null;

      API.setLocation(sample, location);
    }
  },

  validateGridRef(data) {
    /**
     * Validates the new location
     * @param attrs
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
      return true;
    }

    radio.trigger('gridref:form:data:invalid', validationError);
    return false;
  },

  onPastLocationsClick(sample) {
    radio.trigger('settings:locations', {
      onSelect(location) {
        sample.set('locationName', location.name);
        delete location.name;
        sample.set('location', location);
        window.history.back();
      },
    });
  },

  onLocationLockClick() {
    Log('Location:Controller: executing onLocationLockClick.');
    // invert the lock of the attribute
    // real value will be put on exit
    appModel.setAttrLock('location', !appModel.getAttrLock('location'));
  },

  onNameLockClick() {
    Log('Location:Controller: executing onNameLockClick.');
    // invert the lock of the attribute
    // real value will be put on exit
    appModel.setAttrLock('locationName', !appModel.getAttrLock('locationName'));
  },
};

export { API as default };
