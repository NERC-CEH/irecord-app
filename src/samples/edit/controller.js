/** ****************************************************************************
 * Sample Edit controller.
 *****************************************************************************/
import Backbone from 'backbone';
import _ from 'lodash';
import Morel from 'morel';
import Device from 'helpers/device';
import ImageHelp from 'helpers/image';
import Analytics from 'helpers/analytics';
import Log from 'helpers/log';
import App from 'app';
import radio from 'radio';
import appModel from '../../common/models/app_model';
import userModel from '../../common/models/user_model';
import ImageModel from '../../common/models/image';
import savedSamples from '../../common/saved_samples';
import MainView from './main_view';
import HeaderView from './header_view';
import FooterView from './footer_view';

let id;
let sample;

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

    Log('Samples:Edit:Controller: showing');

    id = sampleID;
    const sample = savedSamples.get(sampleID);
    // Not found
    if (!sample) {
      Log('No sample model found', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (sample.getSyncStatus() === Morel.SYNCED) {
      App.trigger('samples:show', sampleID, { replace: true });
      return;
    }


    // MAIN
    const mainView = new MainView({
      model: new Backbone.Model({ sample, appModel }),
    });
    radio.trigger('app:main', mainView);

    // on finish sync move to show
    function checkIfSynced() {
      if (sample.getSyncStatus() === Morel.SYNCED) {
        App.trigger('samples:show', sampleID, { replace: true });
        return;
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
    const footerView = new FooterView({
      model: sample,
    });

    footerView.on('photo:upload', (e) => {
      const photo = e.target.files[0];
      API.photoUpload(sample, photo);
    });

    footerView.on('childview:photo:delete', (view) => {
      const photo = view.model;
      API.photoDelete(photo);
    });

    // android gallery/camera selection
    footerView.on('photo:selection', () => {
      API.photoSelect(sample);
    });

    radio.trigger('app:footer', footerView);
  },

  save(sample) {
    Log('Samples:Edit:Controller: save clicked');

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
          App.trigger('user:login', { replace: true });
          return;
        }

        // sync
        sample.save(null, { remote: true })
          .catch((response = {}) => {
            const visibleDialog = App.regions.getRegion('dialog').$el.is(":visible");
            if (response.responseJSON && !visibleDialog) {
              let errorMsg = '';
              const errors = response.responseJSON.errors;
              for (const error in errors) {
                const title = errors[error].title;
                const description = errors[error].description || '';
                errorMsg += `<p><b>${title}</b> ${description}</p>`;
              }
              radio.trigger('app:dialog:error', errorMsg);
            } else if (response.message && !visibleDialog) {
              radio.trigger('app:dialog:error', response.message);
            }
          });
        App.trigger('sample:saved');
      })
      .catch((err) => {
        radio.trigger('app:dialog:error', err);
      });
  },

  showInvalidsMessage(invalids) {
    delete invalids.sample.saved; // it wasn't saved so of course this error

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
    Log('Samples:Edit:Controller: photo uploaded');

    const occurrence = sample.getOccurrence();
    // show loader
    API.addPhoto(occurrence, photo, (occErr) => {
      // hide loader
      if (occErr) {
        radio.trigger('app:dialog:error', occErr);
      }
    });
  },

  photoDelete(photo) {
    radio.trigger('app:dialog', {
      title: 'Delete',
      body: 'Are you sure you want to remove this photo from the sample?' +
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
                Log('Samples:Edit:Controller: photo deleted');

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
    Log('Samples:Edit:Controller: photo selection');
    const occurrence = sample.getOccurrence();

    radio.trigger('app:dialog', {
      title: 'Choose a method to upload a photo',
      buttons: [
        {
          title: 'Camera',
          onClick() {
            ImageHelp.getImage((entry) => {
              API.addPhoto(occurrence, entry.nativeURL, (occErr) => {
                if (occErr) {
                  radio.trigger('app:dialog:error', occErr);
                }
              });
            });
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Gallery',
          onClick() {
            ImageHelp.getImage((entry) => {
              API.addPhoto(occurrence, entry.nativeURL, (occErr) => {
                if (occErr) {
                  radio.trigger('app:dialog:error', occErr);
                }
              });
            }, {
              sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
              saveToPhotoAlbum: false,
            });
            radio.trigger('app:dialog:hide');
          },
        },
      ],
    });
  },

  /**
   * Adds a new image to occurrence.
   */
  addPhoto(occurrence, photo, callback) {
    ImageHelp.getImageModel(ImageModel, photo, (err, image) => {
      if (err || !image) {
        const error = new Error('Missing image.');
        callback(error);
        return;
      }
      occurrence.addMedia(image);

      occurrence.save()
        .then(() => callback())
        .catch((error) => {
          Log(error, 'e');
          callback(error);
        });
    });
  },
};

export { API as default };
