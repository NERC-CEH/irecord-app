/** ****************************************************************************
 * Surveys Samples List controller.
 **************************************************************************** */
import _ from 'lodash';
import Indicia from 'indicia';
import radio from 'radio';
import savedSamples from 'saved_samples';
import Log from 'helpers/log';
import Occurrence from 'occurrence';
import Factory from 'model_factory';
import ImageHelp from 'helpers/image';
import showErrMsg from 'helpers/show_err_msg';
import MainView from './main_view';
import HeaderView from './header_view';
import SurveysEditController from '../../edit/controller';

const API = {
  show(options = {}) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      savedSamples.once('fetching:done', () => {
        API.show.apply(this, [options]);
      });
      return;
    }

    Log('Surveys:Samples:List:Controller: showing.');

    const surveySample = savedSamples.get(options.surveySampleID);
    // Not found
    if (!surveySample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (surveySample.getSyncStatus() === Indicia.SYNCED) {
      radio.trigger('samples:show', options.surveySampleID, { replace: true });
      return;
    }

    API._showMainView(surveySample, options);

    // HEADER
    const headerView = new HeaderView({ model: surveySample });
    // header pic upload
    headerView.on('photo:upload', e => {
      const photo = e.target.files[0];
      API.photoUpload(surveySample, photo);
    });

    // android gallery/camera selection
    headerView.on('photo:selection', () => API.photoSelect(surveySample));
    headerView.on('create', () => {
      radio.trigger(
        'surveys:samples:edit:taxon',
        options.surveySampleID,
        null,
        {
          onSuccess(taxon, editButtonClicked) {
            API.createNewSample(surveySample, taxon, editButtonClicked);
          },
          showEditButton: true,
          informalGroups: surveySample.getSurvey().taxonGroups
        }
      );
    });

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  _showMainView(surveySample, options) {
    // MAIN
    const mainView = new MainView({
      collection: surveySample.samples,
      surveySample,
      scroll: options.scroll
    });

    // 'Add +' list button
    mainView.on('childview:create', () => {
      radio.trigger(
        'surveys:samples:edit:taxon',
        options.surveySampleID,
        null,
        {
          onSuccess(taxon, editButtonClicked) {
            API.createNewSample(surveySample, taxon, editButtonClicked);
          },
          showEditButton: true,
          informalGroups: surveySample.getSurvey().taxonGroups
        }
      );
    });
    mainView.on('childview:sample:delete', childView => {
      childView.el.closeOpened();
      API.sampleDelete(childView.model);
    });
    radio.trigger('app:main', mainView);
  },

  sampleDelete(sample) {
    Log('Surveys:Samples:List:Controller: deleting sample.');
    sample.destroy();
  },

  photoUpload(surveySample, photo) {
    Log('Surveys:Samples:List:Controller: photo upload.');
    API.createNewSampleWithPhoto(surveySample, photo);
  },

  photoSelect(surveySample) {
    Log('Surveys:Samples:List:Controller: photo select.');

    radio.trigger('app:dialog', {
      title: 'Choose a method to upload a photo',
      buttons: [
        {
          title: 'Camera',
          onClick() {
            ImageHelp.getImage()
              .then(entry => {
                entry &&
                  API.createNewSampleWithPhoto(surveySample, entry.nativeURL);
              })
              .catch(showErrMsg);
            radio.trigger('app:dialog:hide');
          }
        },
        {
          title: 'Gallery',
          onClick() {
            ImageHelp.getImage({
              sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
              saveToPhotoAlbum: false
            })
              .then(entry => {
                entry &&
                  API.createNewSampleWithPhoto(surveySample, entry.nativeURL);
              })
              .catch(showErrMsg);
            radio.trigger('app:dialog:hide');
          }
        }
      ]
    });
  },

  /**
   * Creates new subsample with a pic and empty occurrence taxon.
   * @param surveySample
   * @param photo
   * @returns {*}
   */
  createNewSampleWithPhoto(surveySample, photo) {
    // TODO: show loader
    return (
      Factory.createSampleWithPhoto('plant', photo)
        .then(sample => API.configNewSample(surveySample, sample))
        // rerender the view since smart list doesn't do that yet
        .then(() => API._showMainView(surveySample, {}))
        .catch(err => {
          Log(err, 'e');
          radio.trigger('app:dialog:error', err);
        })
    );
  },

  /**
   * Creates a subsample with occurrence set to new taxon.
   * @param surveySample
   * @param taxon
   */
  createNewSample(surveySample, taxon, editButtonClicked) {
    return Factory.createSample('plant')
      .then(sample => {
        const occurrence = new Occurrence({ taxon });
        sample.addOccurrence(occurrence);
        return API.configNewSample(surveySample, sample, taxon);
      })
      .then(sample => {
        if (editButtonClicked) {
          radio.trigger('surveys:samples:edit', surveySample.cid, sample.cid, {
            replace: true
          });
          return;
        }

        // reset the search field
        radio.trigger('taxon:search:reset');

        radio.trigger('app:dialog', {
          title: 'Added',
          timeout: 500
        });
      })
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  /**
   * Configures survey subsample with default attrs and sets it
   * to the parent survey sample.
   * @param surveySample
   * @param sample
   * @param taxon
   * @returns {*}
   */
  configNewSample(surveySample, sample) {
    // set sample location to survey's location which
    // can be corrected by GPS or user later on
    // TODO: listen for surveySample attribute changes
    if (SurveysEditController.isSurveyLocationSet(surveySample)) {
      const surveyLocation = _.cloneDeep(surveySample.get('location'));
      delete surveyLocation.name;

      sample.set('location', surveyLocation);
      // sample.set('recorder_count', surveySample.get('recorder_count'));
      // sample.set('recorder_names', surveySample.get('recorder_names'));

      sample.startGPS();
    }

    surveySample.addSample(sample);

    return surveySample.save().then(() => sample);
  }
};

export { API as default };
