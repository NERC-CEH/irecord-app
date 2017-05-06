/** ****************************************************************************
 * Sample List controller.
 *****************************************************************************/
import Indicia from 'indicia';
import radio from 'radio';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import ImageHelp from 'helpers/image';
import appModel from 'app_model';
import savedSamples from 'saved_samples';
import Sample from 'sample';
import MainView from './main_view';
import HeaderView from './header_view';

const API = {
  show() {
    Log(`Samples:List:Controller: showing ${savedSamples.length}.`);

    // MAIN
    const mainView = new MainView({
      collection: savedSamples.subcollection({
        filter: model => !model.metadata.complex_survey,
      }),
      appModel,
    });

    mainView.on('childview:create', () => API.createNewSample());
    mainView.on('childview:sample:edit:attr', (childView, attr) => {
      radio.trigger('samples:edit:attr', childView.model.cid, attr);
    });

    mainView.on('childview:taxon:add', (childView) => {
      const sample = childView.model;
      radio.trigger('samples:edit:attr', sample.cid, 'taxon', {
        onSuccess(taxon, editButtonClicked) {
          API.setTaxon(sample, taxon, editButtonClicked);
        },
        showEditButton: true,
      });
    });

    mainView.on('childview:sample:delete', (childView) => {
      API.sampleDelete(childView.model);
    });
    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({ model: appModel });

    headerView.on('photo:upload', (e) => {
      const photo = e.target.files[0];
      API.photoUpload(photo);
    });

    // android gallery/camera selection
    headerView.on('photo:selection', API.photoSelect);
    headerView.on('create', () => API.createNewSample());
    headerView.on('surveys', () => {
      radio.trigger('surveys:list', { replace: true });
    });

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  sampleDelete(sample) {
    Log('Samples:List:Controller: deleting sample.');

    const syncStatus = sample.getSyncStatus();
    let body = 'This record hasn\'t been saved to iRecord yet, ' +
      'are you sure you want to remove it from your device?';

    if (syncStatus === Indicia.SYNCED) {
      body = 'Are you sure you want to remove this record from your device?';
      body += '</br><i><b>Note:</b> it will remain on the server.</i>';
    }
    radio.trigger('app:dialog', {
      title: 'Delete',
      body,
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
            sample.destroy();
            radio.trigger('app:dialog:hide');
            Analytics.trackEvent('List', 'sample remove');
          },
        },
      ],
    });
  },

  photoUpload(photo) {
    Log('Samples:List:Controller: photo upload.');

    // todo: show loader
    Sample.createNewSampleWithPhoto('general', photo)
      .then(sample => sample.save())
      .then((sample) => {
        // add to main collection
        savedSamples.add(sample);
      })
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  photoSelect() {
    Log('Samples:List:Controller: photo select.');

    radio.trigger('app:dialog', {
      title: 'Choose a method to upload a photo',
      buttons: [
        {
          title: 'Camera',
          onClick() {
            ImageHelp.getImage((entry) => {
              Sample.createNewSampleWithPhoto('general', entry.nativeURL);
            });
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Gallery',
          onClick() {
            ImageHelp.getImage((entry) => {
              Sample.createNewSampleWithPhoto('general', entry.nativeURL, () => {});
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

  createNewSample() {
    radio.trigger('samples:edit:attr', null, 'taxon', {
      onSuccess(taxon, editButtonClicked) {
        Sample.createNewSample('general', null, taxon)
          .then(sample => sample.save())
          .then((sample) => {
            // add to main collection
            savedSamples.add(sample);

            // navigate
            if (editButtonClicked) {
              radio.trigger('samples:edit', sample.cid, { replace: true });
            } else {
              // return back to list page
              window.history.back();
            }
          });
      },
      showEditButton: true,
    });
  },

  /**
   * Sets a new taxon to an occurrence created by a photo-first method.
   * @param sample
   * @param taxon
   * @param editButtonClicked
   * @returns {*}
   */
  setTaxon(sample, taxon, editButtonClicked) {
    sample.getOccurrence().set('taxon', taxon);
    // return to previous - edit page
    return sample.save().then(() => {
      if (editButtonClicked) {
        radio.trigger('samples:edit', sample.cid, { replace: true });
      } else {
        // return back to list page
        window.history.back();
      }
    });
  },
};

export { API as default };
