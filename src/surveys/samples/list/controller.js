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
import CONFIG from 'config';
import appModel from 'app_model';
import MainView from './main_view';
import HeaderView from './header_view';
import SurveysEditController from '../../edit/controller';

const API = {
  show(options = {}) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that, [options]);
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

    // MAIN
    const mainView = new MainView({
      collection: surveySample.samples,
      surveySampleID: surveySample.cid,
      scroll: options.scroll,
    });

    // 'Add +' list button
    mainView.on('childview:create', () => {
      radio.trigger('surveys:samples:edit:taxon', options.surveySampleID, null, {
        onSuccess(taxon, editButtonClicked) {
          API.createNewSample(surveySample, taxon, editButtonClicked);
        },
        showEditButton: true,
        informalGroups: CONFIG.indicia.surveys.plant.informal_groups,
      });
    });
    mainView.on('childview:sample:delete', (childView) => {
      API.sampleDelete(childView.model);
    });
    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({ model: appModel });
    // header pic upload
    headerView.on('photo:upload', (e) => {
      const photo = e.target.files[0];
      API.photoUpload(surveySample, photo);
    });

    // android gallery/camera selection
    headerView.on('photo:selection', () => API.photoSelect(surveySample));
    headerView.on('create', () => {
      radio.trigger('surveys:samples:edit:taxon', options.surveySampleID, null, {
        onSuccess(taxon, editButtonClicked) {
          API.createNewSample(surveySample, taxon, editButtonClicked);
        },
        showEditButton: true,
        informalGroups: CONFIG.indicia.surveys.plant.informal_groups,
      });
    });

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
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
            ImageHelp.getImage((entry) => {
              API.createNewSampleWithPhoto(surveySample, entry.nativeURL);
            });
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Gallery',
          onClick() {
            ImageHelp.getImage((entry) => {
              API.createNewSampleWithPhoto(surveySample, entry.nativeURL);
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
   * Creates new subsample with a pic and empty occurrence taxon.
   * @param surveySample
   * @param photo
   * @returns {*}
   */
  createNewSampleWithPhoto(surveySample, photo) {
    // todo: show loader
    return Sample.createNewSampleWithPhoto('plant', photo)
      .then(sample => API.configNewSample(surveySample, sample))
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
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
        const occurrence = new Occurrence({ taxon });
        sample.addOccurrence(occurrence);
        return API.configNewSample(surveySample, sample, taxon);
      })
      .then((sample) => {
        if (editButtonClicked) {
          radio.trigger(
            'surveys:samples:edit',
            surveySample.cid,
            sample.cid,
            { replace: true },
          );
          return;
        }

        // reset the search field
        radio.trigger('taxon:search:reset');

        radio.trigger('app:dialog', {
          title: 'Added',
          timeout: 500,
        });
      })
      .catch((err) => {
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
    // todo: listen for surveySample attribute changes
    if (SurveysEditController.isSurveyLocationSet(surveySample)) {
      const surveyLocation = _.cloneDeep(surveySample.get('location'));
      sample.set('location', surveyLocation);
      sample.set('recorder_count', surveySample.get('recorder_count'));
      sample.set('recorder_names', surveySample.get('recorder_names'));
    }

    surveySample.addSample(sample);

    return surveySample.save().then(() => sample);
  },
};

export { API as default };
