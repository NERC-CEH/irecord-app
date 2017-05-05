/** ****************************************************************************
 * Surveys Samples List controller.
 *****************************************************************************/
import _ from 'lodash';
import Indicia from 'indicia';
import radio from 'radio';
import savedSamples from 'saved_samples';
import Log from 'helpers/log';
import Occurrence from 'occurrence';
import Sample from 'sample';
import ImageHelp from 'helpers/image';
import appModel from 'app_model';
import MainView from './main_view';
import HeaderView from './header_view';

const API = {
  show(surveySampleID) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that, [surveySampleID]);
      });
      return;
    }

    Log('Surveys:Samples:List:Controller: showing.');

    const surveySample = savedSamples.get(surveySampleID);
    // Not found
    if (!surveySample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (surveySample.getSyncStatus() === Indicia.SYNCED) {
      radio.trigger('samples:show', surveySampleID, { replace: true });
      return;
    }

    // MAIN
    const mainView = new MainView({
      collection: surveySample.samples,
      surveySampleID: surveySample.cid,
    });
    mainView.on('childview:create', () => {
      radio.trigger('surveys:samples:edit:taxon', surveySampleID, null, {
        onSuccess(taxon, editButtonClicked) {
          API.createNewSample(surveySample, taxon, editButtonClicked);
        },
        showEditButton: true,
        informalGroups: [89],
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
      API.photoUpload(surveySample, photo);
    });

    // android gallery/camera selection
    headerView.on('photo:selection', API.photoSelect);
    headerView.on('create', () => {
      radio.trigger('surveys:samples:edit:taxon', surveySampleID, null, {
        onSuccess(taxon, editButtonClicked) {
          API.createNewSample(surveySample, taxon, editButtonClicked);
        },
        showEditButton: true,
      });
    });

    radio.trigger('app:header', headerView);
  },


  sampleDelete(sample) {
    Log('Surveys:Samples:List:Controller: deleting sample.');
    sample.destroy();
  },

  photoUpload(surveySample, photo) {
    Log('Surveys:Samples:List:Controller: photo upload.');

    // todo: show loader
    Sample.createNewSampleWithPhoto(photo)
      .then((sample) => {
        surveySample.addSample(sample);
        return surveySample.save();
      })
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  photoSelect() {
    Log('Surveys:Samples:List:Controller: photo select.');

    radio.trigger('app:dialog', {
      title: 'Choose a method to upload a photo',
      buttons: [
        {
          title: 'Camera',
          onClick() {
            ImageHelp.getImage((entry) => {
              Sample.createNewSampleWithPhoto(entry.nativeURL, () => {});
            });
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Gallery',
          onClick() {
            ImageHelp.getImage((entry) => {
              Sample.createNewSampleWithPhoto(entry.nativeURL, () => {});
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
   * Creates a subsample with occurrence set to new taxon.
   * @param surveySample
   * @param taxon
   */
  createNewSample(surveySample, taxon, editButtonClicked) {
    return Sample.createNewSample('plant')
      .then((sample) => {
        // set sample location to survey's location which
        // can be corrected by GPS or user later on
        // todo: listen for surveySample attribute changes
        const surveyLocation = _.cloneDeep(surveySample.get('location'));
        sample.set('location', surveyLocation);
        sample.set('recorder_count', surveySample.get('recorder_count'));
        sample.set('recorder_names', surveySample.get('recorder_names'));

        const occurrence = new Occurrence({ taxon });
        sample.addOccurrence(occurrence);

        surveySample.addSample(sample);

        return surveySample.save().then(() => {
          if (editButtonClicked) {
            radio.trigger(
              'surveys:samples:edit',
              surveySample.cid,
              sample.cid,
              { replace: true },
            );
          } else {
            radio.trigger('app:dialog', {
              title: 'Added',
              timeout: 500,
            });
          }
        });
      })
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },
};

export { API as default };
