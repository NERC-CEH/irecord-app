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

    // plant survey
    if (survey === 'plant') {
      return Factory._getPlantSample(image, taxon);
    }

    return Factory._getGeneralSample(image, taxon);
  },

  _getPlantSample(image, taxon) {
    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.hasLogIn()) {
      recorders.push(
        `${userModel.get('firstname')} ${userModel.get('secondname')}`
      );
    }

    const sample = new Sample(
      {
        location_type: 'british',
        sample_method_id: 7305,
        recorders,
      },
      {
        metadata: {
          survey: 'plant',
          complex_survey: true,
          gridSquareUnit: appModel.get('gridSquareUnit'),
        },
      }
    );

    // occurrence with image - pic select-first only
    if (image) {
      const occurrence = new Occurrence({ taxon });
      occurrence.addMedia(image);
      sample.addOccurrence(occurrence);
    }

    return Promise.resolve(sample);
  },

  _getGeneralSample(image, taxon) {
    // general survey
    const occurrence = new Occurrence();
    if (image) {
      occurrence.addMedia(image);
    }

    const sample = new Sample(null, {
      metadata: {
        survey: 'general',
      },
    });
    sample.addOccurrence(occurrence);

    // append locked attributes
    appModel.appendAttrLocks(sample);

    // check if location attr is not locked
    const locks = appModel.get('attrLocks');

    if (!locks.general || !locks.general.location) {
      // no previous location
      sample.startGPS();
    }

    if (taxon) {
      sample.setTaxon(taxon);
    }

    return Promise.resolve(sample);
  },

  /**
   * Creates a new sample with an image passed as an argument.
   *
   * Empty taxon.
   */
  createSampleWithPhoto(survey, photo) {
    return ImageHelp.getImageModel(ImageModel, photo).then(image =>
      Factory.createSample(survey, image)
    );
  },
};

export default Factory;
