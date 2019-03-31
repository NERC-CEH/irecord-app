/** ****************************************************************************
 * Survey Edit controller.
 **************************************************************************** */
import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'lodash';
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
      savedSamples.once('fetching:done', () => {
        API.show.apply(this, [sampleID]);
      });
      return;
    }

    Log('Surveys:Edit:Controller: showing.');

    const sample = savedSamples.get(sampleID);
    // Not found
    if (!sample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (sample.metadata.synced_on) {
      radio.trigger('surveys:show', sampleID, { replace: true });
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
        hideLocks: true,
        hidePast: true,
      });
    });

    radio.trigger('app:main', mainView);

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
    Log('Surveys:Edit:Controller: save clicked.');

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
            message: t('Looks like you are offline!'),
          });
          return;
        }

        if (!userModel.hasLogIn()) {
          radio.trigger('user:login', { replace: true });
          return;
        }

        // sync
        sample.save(null, { remote: true }).catch((err = {}) => {
          Log(err, 'e');

          const visibleDialog = App.regions
            .getRegion('dialog')
            .$el.is(':visible');
          // we don't want to close any other dialog
          if (err.message && !visibleDialog) {
            radio.trigger(
              'app:dialog:error',
              `Sorry, we have encountered a problem while sending the record.
                
                 <p><i>${err.message}</i></p>`
            );
          }
        });
        radio.trigger('sample:saved');
      })
      .catch(err => {
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
    function deepErrorsMsg(errorModel, child) {
      let missing = '';
      _.each(errorModel.attributes, (message, invalid) => {
        if (child) {
          missing += `species <b>${invalid}</b> - ${message}</br>`;
          return;
        }

        missing += `<b>${invalid}</b> - ${message}</br>`;
      });

      // separate child models
      if (!child) {
        missing += '<hr>';
      }

      _.each(errorModel.samples, model => {
        missing += deepErrorsMsg(model, true);
      });
      _.each(errorModel.occurrences, model => {
        missing += deepErrorsMsg(model, true);
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

  showInvalidLocationMessage(squareSize) {
    const prettyName = LocHelp.gridref_accuracy[squareSize].label;

    radio.trigger('app:dialog', {
      title: `Selected location should be a ${prettyName}`,
      timeout: 2000,
    });
  },

  /**
   * Sets new sample location and if a full location (+name) then sets that
   * to the child samples.
   * @param sample
   * @param loc
   * @param reset
   * @returns {Promise.<T>}
   */
  setLocation(sample, loc, reset) {
    // 1st validation of location accuracy
    let gridSquareUnit = sample.metadata.gridSquareUnit;
    if (!LocHelp.checkGridType(loc, gridSquareUnit)) {
      // check if the grid unit has been changed and it matches the new unit
      // or this is the first time we are setting a location
      gridSquareUnit = appModel.get('gridSquareUnit');
      if (!LocHelp.checkGridType(loc, gridSquareUnit)) {
        API.showInvalidLocationMessage(gridSquareUnit);
        return Promise.resolve();
      }
    }

    let location = loc;
    // we don't need the GPS running and overwriting the selected location
    if (sample.isGPSRunning()) {
      sample.stopGPS();
    }

    if (!reset) {
      // extend old location to preserve its previous attributes like name or id
      let oldLocation = sample.get('location');
      if (!_.isObject(oldLocation)) {
        oldLocation = {};
      } // check for locked true
      location = $.extend(oldLocation, location);
    }

    // save to past locations
    const locationID = appModel.setLocation(location);
    location.id = locationID;

    // set the gridSquareUnit so that future changes in the settings don't change that;
    sample.metadata.gridSquareUnit = gridSquareUnit; // eslint-disable-line

    sample.set('location', location);
    sample.trigger('change:location');

    // 2nd validation of the location name
    if (location.name) {
      API.updateChildrenLocations(sample);
    }

    return sample.save().catch(error => {
      Log(error, 'e');
      radio.trigger('app:dialog:error', error);
    });
  },

  /**
   * Updates child sample locations to match the parent (survey) sample.
   * @param sample
   */
  updateChildrenLocations(sample) {
    sample.samples.forEach(child => {
      const loc = child.get('location');

      // the child must not have any location
      if (loc.latitude) {
        throw new Error('Child location has a location set already.');
      }

      const location = _.cloneDeep(sample.get('location'));
      delete location.name;
      child.set('location', location);
    });
  },

  /**
   * Checks if sample's location accuracy matches selected user default
   * accuracy.
   * @param surveySample
   * @returns {boolean}
   */
  isSurveyLocationSet(surveySample) {
    const location = surveySample.get('location');
    const accurateEnough = LocHelp.checkGridType(
      location,
      surveySample.metadata.gridSquareUnit
    );
    return accurateEnough && location.name;
  },

  /**
   * Checks if the sample has child samples with any location set.
   * @param surveySample
   * @returns {boolean}
   */
  hasChildSamplesWithLocation(surveySample) {
    let has = false;
    surveySample.samples.forEach(sample => {
      const location = sample.get('location') || {};
      if (location.latitude) {
        has = true;
      }
    });

    return has;
  },
};

export { API as default };
