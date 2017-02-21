import API from '../controller';
import savedSamples from 'saved_samples';


describe('List Controller', function () {
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
    before((done) => {
      // clean up in case of trash
      savedSamples.fetch()
        .then(() => savedSamples.destroy())
        .then(() => done());
    });

    afterEach((done) => {
      // clean up in case of trash
      savedSamples.fetch()
        .then(() => savedSamples.destroy())
        .then(() => done());
    });

    it('should create a new sample with a photo', (done) => {
      done();
    });

    it('should throw error if no image is provided', (done) => {
      // Controller.createNewSample(null, (err) => {
      //  expect(err).to.not.be.null;
      //  done();
      // });
      done();
    });
  });
});
