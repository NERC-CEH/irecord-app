import Morel from 'morel';
import imageURI from './imageURI';
import Controller from '../controller';
import recordManager from '../../../common/record_manager';


describe('Controller', function () {
  // it can take time to add/remove records
  this.timeout(10000);

  describe('photo picker', () => {
    before((done) => {
      recordManager.clear(done);
    });

    afterEach((done) => {
      recordManager.clear(done);
    });

    it('should create a new record with a photo', (done) => {
        done();
    });

    it('should throw error if no image is provided', (done) => {
      //Controller.createNewRecord(null, (err) => {
      //  expect(err).to.not.be.null;
      //  done();
      //});
      done();
    });

  });
});
