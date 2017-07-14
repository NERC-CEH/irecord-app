import ImageHelp from 'helpers/image';
import userModel from 'user_model';
import appModel from 'app_model';
import ImageModel from './image';
import Sample from './sample';
import Occurrence from './occurrence';

const Factory = {
  createSample(survey, image, taxon) {
    if (!survey) {
      return Promise.reject(new Error('Survey options are missing.'));
    }

    let sample;

    // plant survey
    if (survey === 'plant') {
      // add currently logged in user as one of the recorders
      const recorders = [];
      if (userModel.hasLogIn()) {
        recorders.push(`${userModel.get('firstname')} ${userModel.get('secondname')}`);
      }

      sample = new Sample({
        location_type: 'british',
        sample_method_id: 7305,
        recorders,
      }, {
        metadata: {
          survey: 'plant',
          complex_survey: true,
          gridSquareUnit: appModel.get('gridSquareUnit'),
        },
      });

      // occurrence with image - pic select-first only
      if (image) {
        const occurrence = new Occurrence({taxon});
        occurrence.addMedia(image);
        sample.addOccurrence(occurrence);
      }

      return Promise.resolve(sample);
    }

    // general survey
    const occurrence = new Occurrence({taxon});
    if (image) {
      occurrence.addMedia(image);
    }

    sample = new Sample(null, {
      metadata: {
        survey: 'general',
      },
    });
    sample.addOccurrence(occurrence);

    // append locked attributes
    appModel.appendAttrLocks(sample);

    // check if location attr is not locked
    const locks = appModel.get('attrLocks');

    if (!locks.location) {
      // no previous location
      sample.startGPS();
    } else if (!locks.location.latitude) {
      // previously locked location was through GPS
      // so try again
      sample.startGPS();
    }
    return Promise.resolve(sample);
  },

  /**
   * Creates a new sample with an image passed as an argument.
   *
   * Empty taxon.
   */
  createSampleWithPhoto(survey, photo) {
    return ImageHelp.getImageModel(ImageModel, photo)
      .then(image => Factory.createSample(survey, image));
  },
};

export default Factory;
