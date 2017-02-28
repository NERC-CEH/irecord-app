import appModel from 'app_model';
import Occurrence from 'occurrence';
import { getRandomSample } from 'test-helpers';

/* eslint-disable no-unused-expressions */

describe('Occurrence', () => {
  it('should set occurrence to training mode', () => {
    appModel.set('useTraining', false);

    let sample = getRandomSample();
    expect(sample.getOccurrence().metadata.training).to.be.equal(false);

    appModel.set('useTraining', true);

    sample = getRandomSample();
    expect(sample.getOccurrence().metadata.training).to.be.equal(true);
  });

  it('should validate', () => {
    const occurrence = new Occurrence();
    expect(occurrence.validate).to.be.a('function');
    occurrence.clear();

    const invalids = occurrence.validate({ remote: true });
    expect(invalids).to.be.an('object')
      .and.have.property('taxon');
  });
});
