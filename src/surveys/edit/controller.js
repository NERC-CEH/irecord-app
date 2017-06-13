/** ****************************************************************************
 * Survey Edit controller.
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'lodash';
import Indicia from 'indicia';
import Device from 'helpers/device';
import Log from 'helpers/log';
import App from 'app';
import radio from 'radio';
import appModel from 'app_model';
import userModel from 'user_model';
import LocHelp from 'helpers/location';
import savedSamples from 'saved_samples';
import MainView from './main_view';
import HeaderView from './header_view';

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

    Log('Samples:Edit:Controller: showing.');

    const sample = savedSamples.get(sampleID);
    // Not found
    if (!sample) {
      Log('No sample model found.', 'e');
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
    const locationEditAllowed = !API.hasChildSamplesWithLocation(sample);
    const mainView = new MainView({
      locationEditAllowed,
      model: new Backbone.Model({ sample, appModel }),
    });
    mainView.on('location:update', () => {
      radio.trigger('app:location:show', sample.cid, null, {
        setLocation: API.setLocation,
      });
    });

    radio.trigger('app:main', mainView);

    // on finish sync move to show
    function checkIfSynced() {
      if (sample.getSyncStatus() === Indicia.SYNCED) {
        radio.trigger('samples:show', sampleID, { replace: true });
      }
    }
    sample.on('request sync error', checkIfSynced);
    mainView.on('destroy', () => {
      // unbind when page destroyed
      sample.off('request sync error', checkIfSynced);
    });


    // HEADER
    const headerView = new HeaderView({
      model: sample,
    });

    headerView.on('save', () => {
      API.save(sample);
    });

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  save(sample) {
    Log('Samples:Edit:Controller: save clicked.');

    const promise = sample.setToSend();

    // invalid sample
    if (!promise) {
      const invalids = sample.validationError;
      API.showInvalidsMessage(invalids);
      return;
    }

    promise
      .then(() => {
        // should we sync?
        if (!Device.isOnline()) {
          radio.trigger('app:dialog:error', {
            message: 'Looks like you are offline!',
          });
          return;
        }

        if (!userModel.hasLogIn()) {
          radio.trigger('user:login', { replace: true });
          return;
        }

        // sync
        sample.save(null, { remote: true })
          .catch((err = {}) => {
            Log(err, 'e');

            const visibleDialog = App.regions.getRegion('dialog').$el.is(':visible');
            // we don't want to close any other dialog
            if (err.message && !visibleDialog) {
              radio.trigger('app:dialog:error',
                `Sorry, we have encountered a problem while sending the record.
                
                 <p><i>${err.message}</i></p>`
              );
            }
          });
        radio.trigger('sample:saved');
      })
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  showInvalidsMessage(invalids) {
    // it wasn't saved so of course this error
    delete invalids.attributes.saved; // eslint-disable-line

    /**
     * Creates an invalids message recursively.
     * @param errorModel
     */
    function deepErrorsMsg(errorModel) {
      let missing = '';
      _.each(errorModel.attributes, (message, invalid) => {
        missing += `<b>${invalid}</b> - ${message}</br>`;
      });

      _.each(errorModel.samples, (model) => {
        missing += deepErrorsMsg(model);
      });
      _.each(errorModel.occurrences, (model) => {
        missing += deepErrorsMsg(model);
      });

      return missing;
    }

    const missing = deepErrorsMsg(invalids) || '';

    radio.trigger('app:dialog', {
      title: 'Sorry',
      body: missing,
      timeout: 2000,
    });
  },

  showInvalidLocationMessage(sample) {
    const squareSize = sample.metadata.surveyAccuracy;

    radio.trigger('app:dialog', {
      title: `Selected location should be a ${squareSize}`,
      timeout: 2000,
    });
  },

  setLocation(sample, loc, reset) {
    // 1st validation of location accuracy
    const valid = API.isSurveyLocationAccurate(sample, loc);
    if (!valid) {
      API.showInvalidLocationMessage(sample);
      return Promise.resolve();
    }

    let location = loc;
    // we don't need the GPS running and overwriting the selected location
    if (sample.isGPSRunning()) {
      sample.stopGPS();
    }

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

    // 2nd validation of the location name
    if (location.name) {
      API.updateChildrenLocations(sample, location);
    }

    return sample.save()
      .catch((error) => {
        Log(error, 'e');
        radio.trigger('app:dialog:error', error);
      });
  },

  updateChildrenLocations(sample, location) {
    sample.samples.forEach((child) => {
      const loc = child.get('location');

      if (loc.latitude) {
        throw new Error('Child location has a location set already.');
      }

      child.set('location', $.extend(true, {}, location));
    });
  },

  /**
   * Checks if sample's location accuracy matches selected user default
   * accuracy.
   * @param surveySample
   * @returns {boolean}
   */
  isSurveyLocationSet(surveySample, location) {
   const accurateEnough = API.isSurveyLocationAccurate(surveySample, location);
    return accurateEnough && location.name;
  },

  isSurveyLocationAccurate(surveySample, location) {
    const surveyAccuracy = surveySample.metadata.surveyAccuracy;
    const surveyLocation = location || surveySample.get('location') || { };
    surveyLocation.gridref || (surveyLocation.gridref = '');
    return surveyLocation.gridref.length === LocHelp.gridref_accuracy[surveyAccuracy];
  },

  hasChildSamplesWithLocation(surveySample) {
    let has = false;
    surveySample.samples.forEach((sample) => {
      const location = sample.get('location') || {};
      if (location.latitude) {
        has = true;
      }
    });

    return has;
  },
};

export { API as default };
