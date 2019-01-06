import Sample from 'sample';
import Occurrence from 'occurrence';
import { updateTaxon } from '../index';

describe('Edit Controller', () => {
  describe('updateTaxon', () => {
    let sampleSetTaxonStub;
    before(() => {
      sampleSetTaxonStub = sinon
        .stub(Sample.prototype, 'setTaxon')
        .returns(Promise.reject());
    });

    after(() => {
      sampleSetTaxonStub.restore();
    });

    it('should call sample.setTaxon', done => {
      const sample = new Sample();
      sample.addOccurrence(new Occurrence());

      updateTaxon(sample, { activity: 1 })
        .then(() => {
          expect(sampleSetTaxonStub.called).to.be.equal(true);
          done();
        })
        .catch(done);
    });
  });
});
