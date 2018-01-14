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
      expect(Factory._getGeneralSample()).to.be.instanceOf(Promise);
    });

    it('should call sample.setTaxon', () => {
      Factory._getGeneralSample(null, { group: 1 });
      expect(sampleSetTaxonSpy.called).to.be.equal(true);
    });
  });

  describe('appendAttrLocks', () => {
    it('should exist', () => {
      expect(Factory._appendAttrLocks).to.be.a('function');
    });
  });
});
