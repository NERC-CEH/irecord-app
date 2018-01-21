import Sample from 'sample';
import Occurrence from 'occurrence';
import API from '../controller';

describe('Edit Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a send method', () => {
    expect(API.send).to.be.a('function');
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
    let sampleSetTaxonStub;
    before(() => {
      sampleSetTaxonStub = sinon
        .stub(Sample.prototype, 'setTaxon')
        .returns(Promise.reject());
    });

    after(() => {
      sampleSetTaxonStub.restore();
    });

    it('should exist', () => {
      expect(API.updateTaxon).to.be.a('function');
    });
    it('should call sample.setTaxon', () => {
      const sample = new Sample();
      sample.addOccurrence(new Occurrence());

      API.updateTaxon(sample, { group: 1 });
      expect(sampleSetTaxonStub.called).to.be.equal(true);
    });
  });
});
