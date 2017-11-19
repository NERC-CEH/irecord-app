import Sample from 'sample';
import API from '../controller';

describe('Edit Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a save method', () => {
    expect(API.save).to.be.a('function');
  });

  it('should have a photoUpload method', () => {
    expect(API.photoUpload).to.be.a('function');
  });

  it('should have a photoDelete method', () => {
    expect(API.photoDelete).to.be.a('function');
  });

  it('should have a photoSelect method', () => {
    expect(API.photoSelect).to.be.a('function');
  });

  describe('updateTaxon', () => {
    let sampleSetTaxonSpy;
    before(() => {
      sampleSetTaxonSpy = sinon.spy(Sample.prototype, 'setTaxon');
    });

    after(() => {
      sampleSetTaxonSpy.restore();
    });

    it('should exist', () => {
      expect(API.updateTaxon).to.be.a('function');
    });
    it('should call sample.setTaxon', () => {
      const sample = new Sample();
      API.updateTaxon(sample, {});
      expect(sampleSetTaxonSpy.called).to.be.equal(true);
    });
  });
});
