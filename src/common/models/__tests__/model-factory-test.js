import Sample from 'sample';
import Factory from '../model_factory';

describe('Model Factory', () => {
  describe('_getGeneralSample', () => {
    let sampleSetTaxonSpy;
    before(() => {
      sampleSetTaxonSpy = sinon.spy(Sample.prototype, 'setTaxon');
    });
    after(() => {
      sampleSetTaxonSpy.restore();
    });
    it('should return a promise', () => {
      expect(Factory._getGeneralSample(null, {})).to.be.instanceOf(Promise);
    });

    it('should call sample.setTaxon', () => {
      Factory._getGeneralSample(null, {});
      expect(sampleSetTaxonSpy.called).to.be.equal(true);
    });
  });
});
