import savedSamples from 'saved_samples';
import Sample from 'sample';
import Occurrence from 'occurrence';
import API from '../controller';

// eslint-disable-next-line
describe('List Controller', function() {
  // it can take time to add/remove samples
  this.timeout(10000);

  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a sampleDelete method', () => {
    expect(API.sampleDelete).to.be.a('function');
  });

  it('should have a photoUpload method', () => {
    expect(API.photoUpload).to.be.a('function');
  });

  it('should have a photoSelect method', () => {
    expect(API.photoSelect).to.be.a('function');
  });

  it('should have a sampleDelete method', () => {
    expect(API.sampleDelete).to.be.a('function');
  });

  describe('photo picker', () => {
    before(done => {
      // clean up in case of trash
      savedSamples
        .fetch()
        .then(() => savedSamples.destroy())
        .then(() => done());
    });

    afterEach(done => {
      // clean up in case of trash
      savedSamples
        .fetch()
        .then(() => savedSamples.destroy())
        .then(() => done());
    });

    it.skip('should create a new sample with a photo', done => {
      done();
    });

    it.skip('should throw error if no image is provided', done => {
      // Controller.createNewSample(null, (err) => {
      //  expect(err).to.not.be.null;
      //  done();
      // });
      done();
    });
  });

  describe('setTaxon', () => {
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
      expect(API.setTaxon).to.be.a('function');
    });
    it('should call sample.setTaxon', () => {
      const sample = new Sample();
      sample.addOccurrence(new Occurrence());
      API.setTaxon(sample, { group: 1 });
      expect(sampleSetTaxonStub.called).to.be.equal(true);
    });
  });
});
