/** ****************************************************************************
 * Surveys Sample Edit controller.
 **************************************************************************** */
import Backbone from 'backbone';
import bigu from 'bigu';
import _ from 'lodash';
import $ from 'jquery';
import Device from 'helpers/device';
import ImageHelp from 'helpers/image';
import Analytics from 'helpers/analytics';
import Log from 'helpers/log';
import showErrMsg from 'helpers/show_err_msg';
import App from 'app';
import radio from 'radio';
import appModel from 'app_model';
import userModel from 'user_model';
import CONFIG from 'config';
import savedSamples from 'saved_samples';
import SurveysEditController from '../../edit/controller';
import ImageModel from '../../../common/models/image';
import MainView from './main_view';
import HeaderView from '../../../common/views/header_view';
import FooterView from './footer_view';

const API = {
  show(surveySampleID, sampleID) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      savedSamples.once('fetching:done', () => {
        API.show.apply(this, [surveySampleID, sampleID]);
      });
      return;
    }

    Log('Surveys:Sample:Edit:Controller: showing.');

    const surveySample = savedSamples.get(surveySampleID);
    // Not found
    if (!surveySample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    const sample = surveySample.samples.get(sampleID);
    // Not found
    if (!sample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    const locationEditAllowed = API.isSurveyLocationSet(sample.parent);
    // MAIN
    const mainView = new MainView({
      locationEditAllowed,
      model: new Backbone.Model({ sample, appModel }),
    });
    mainView.on('location:update', () => {
      radio.trigger('app:location:show', surveySampleID, sample.cid, {
        setLocation: API.setLocation,
        hideName: true,
        hideLocks: true,
        hidePast: true,
      });
    });
    radio.trigger('app:main', mainView);

    mainView.on('setting:toggled', (setting, on) => {
      const occ = sample.getOccurrence();
      occ.metadata.sensitivity_precision = on ? 1 : null;
      occ.save();
    });
    mainView.on('taxon:update', () => {
      radio.trigger('surveys:samples:edit:taxon', surveySampleID, sample.cid, {
        onSuccess(taxon) {
          API.updateTaxon(sample, taxon);
        },
        informalGroups: CONFIG.indicia.surveys.plant.informal_groups,
      });
    });

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({ title: 'Edit' }),
    });
    radio.trigger('app:header', headerView);

    // FOOTER
    const footerView = new FooterView({
      model: sample,
    });

    footerView.on('photo:upload', e => {
      const photo = e.target.files[0];
      API.photoUpload(sample, photo);
    });

    footerView.on('childview:photo:delete', model => {
      API.photoDelete(model);
    });

    // android gallery/camera selection
    footerView.on('photo:selection', () => {
      API.photoSelect(sample);
    });

    radio.trigger('app:footer', footerView);
  },

  isSurveyLocationSet: SurveysEditController.isSurveyLocationSet,

  save(sample) {
    Log('Surveys:Sample:Edit:Controller: save clicked.');

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
    delete invalids.sample.saved; // eslint-disable-line

    let missing = '';
    if (invalids.occurrences) {
      _.each(invalids.occurrences, (message, invalid) => {
        missing += `<b>${invalid}</b> - ${message}</br>`;
      });
    }
    if (invalids.sample) {
      _.each(invalids.sample, (message, invalid) => {
        missing += `<b>${invalid}</b> - ${message}</br>`;
      });
    }

    radio.trigger('app:dialog', {
      title: 'Sorry',
      body: missing,
      timeout: 2000,
    });
  },

  photoUpload(sample, photo) {
    Log('Surveys:Sample:Edit:Controller: photo uploaded.');

    const occurrence = sample.getOccurrence();
    // todo: show loader
    API.addPhoto(occurrence, photo).catch(err => {
      Log(err, 'e');
      radio.trigger('app:dialog:error', err);
    });
  },

  photoDelete(photo) {
    radio.trigger('app:dialog', {
      title: 'Delete',
      body:
        'Are you sure you want to remove this photo from the sample?' +
        '</br><i><b>Note:</b> it will remain in the gallery.</i>',
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Delete',
          class: 'btn-negative',
          onClick() {
            // show loader
            photo.destroy({
              success: () => {
                Log('Surveys:Sample:Edit:Controller: photo deleted.');

                // hide loader
              },
            });
            radio.trigger('app:dialog:hide');
            Analytics.trackEvent('Sample', 'photo remove');
          },
        },
      ],
    });
  },

  photoSelect(sample) {
    Log('Surveys:Sample:Edit:Controller: photo selection.');
    const occurrence = sample.getOccurrence();

    radio.trigger('app:dialog', {
      title: 'Choose a method to upload a photo',
      buttons: [
        {
          title: 'Camera',
          onClick() {
            ImageHelp.getImage()
              .then(entry => {
                entry &&
                  API.addPhoto(occurrence, entry.nativeURL, occErr => {
                    if (occErr) {
                      radio.trigger('app:dialog:error', occErr);
                    }
                  });
              })
              .catch(showErrMsg);
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Gallery',
          onClick() {
            ImageHelp.getImage({
              sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
              saveToPhotoAlbum: false,
            })
              .then(entry => {
                entry &&
                  API.addPhoto(occurrence, entry.nativeURL, occErr => {
                    if (occErr) {
                      showErrMsg(occErr);
                    }
                  });
              })
              .catch(showErrMsg);
            radio.trigger('app:dialog:hide');
          },
        },
      ],
    });
  },

  showInvalidLocationMessage(sample) {
    const gridref = sample.parent.get('location').gridref;

    radio.trigger('app:dialog', {
      title: `Selected location should be within ${gridref}`,
      timeout: 2000,
    });
  },

  /**
   * Sets location for the sample.
   * @param sample
   * @param loc
   * @param reset
   * @returns {Promise.<T>}
   */
  setLocation(sample, loc, reset) {
    // validate this new location
    const valid = API.validateLocation(sample, loc);
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
      if (!_.isObject(oldLocation)) {
        oldLocation = {};
      } // check for locked true
      location = $.extend(oldLocation, location);
    }

    // save to past locations
    const locationID = appModel.setLocation(location);
    location.id = locationID;

    sample.set('location', location);
    sample.trigger('change:location');

    return sample.save().catch(error => {
      Log(error, 'e');
      radio.trigger('app:dialog:error', error);
    });
  },

  /**
   * Validates if the location fits within the parent location square.
   * @param sample
   * @param location
   * @returns {boolean}
   */
  validateLocation(sample, location) {
    const gridCoords = bigu.latlng_to_grid_coords(
      location.latitude,
      location.longitude
    );

    if (!gridCoords) {
      return false;
    }

    const parentGridref = sample.parent.get('location').gridref;
    const parentParsedRef = bigu.GridRefParser.factory(parentGridref);

    if (location.gridref.length < parentGridref.length) {
      return false;
    }

    return gridCoords.to_gridref(parentParsedRef.length) === parentGridref;
  },

  /**
   * Adds a new image to occurrence.
   */
  addPhoto(occurrence, photo) {
    return ImageHelp.getImageModel(ImageModel, photo).then(image => {
      occurrence.addMedia(image);
      return occurrence.save();
    });
  },

  updateTaxon(sample, taxon) {
    // edit existing one
    sample.getOccurrence().set('taxon', taxon);
    // return to previous - edit page
    return sample.save().then(() => window.history.back());
  },
};

export { API as default };
