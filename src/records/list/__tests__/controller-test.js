import API from '../controller';
import savedRecords from '../../../common/saved_records';


describe('List Controller', function () {
  // it can take time to add/remove records
  this.timeout(10000);

  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a recordDelete method', () => {
    expect(API.recordDelete).to.be.a('function');
  });

  it('should have a photoUpload method', () => {
    expect(API.photoUpload).to.be.a('function');
  });

  it('should have a photoSelect method', () => {
    expect(API.photoSelect).to.be.a('function');
  });

  it('should have a recordDelete method', () => {
    expect(API.recordDelete).to.be.a('function');
  });

  describe('photo picker', () => {
    before((done) => {
      savedRecords.clear(done);
    });

    afterEach((done) => {
      savedRecords.clear(done);
    });

    it('should create a new record with a photo', (done) => {
      done();
    });

    it('should throw error if no image is provided', (done) => {
      // Controller.createNewRecord(null, (err) => {
      //  expect(err).to.not.be.null;
      //  done();
      // });
      done();
    });
  });
});
