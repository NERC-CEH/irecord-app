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

    const RECORDS_COUNT = 50;
    it(`should create a new record with a photo (${RECORDS_COUNT})`, (done) => {
      let recordsToAddCount = RECORDS_COUNT;

      // adds a record
      function addRecord(callback) {
        // create dummy image
        const image = new Morel.Image({
          data: imageURI,
          type: 'image/png',
        });

        Controller.createNewRecord(image, (err) => {
          if (err) throw err.message;
          recordsToAddCount--;
          callback();
        });
      }

      // tests
      function test() {
        // return if not finished adding all
        if (recordsToAddCount !== 0) return;

        recordManager.storage.size((sizeErr, size) => {
          if (sizeErr) throw sizeErr.message;

          expect(size).to.be.equal(RECORDS_COUNT);
          done();
        });
      }

      // add number of records
      for (let i = 0; i < recordsToAddCount; i++) {
        addRecord(test);
      }
    });

    it('should throw error if no image is provided', (done) => {
      Controller.createNewRecord(null, (err) => {
        expect(err).to.not.be.null;
        done();
      });
    });

    it('should accept large images', (done) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const imgData = ctx.createImageData(4500, 4500); //px

      console.log(imgData.data.length);
      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i+0] = (Math.random() * 100).toFixed(0);
        imgData.data[i+1] = (Math.random() * 100).toFixed(0);
        imgData.data[i+2] = (Math.random() * 100).toFixed(0);
        imgData.data[i+3] = 105;
      }
      ctx.putImageData(imgData, 10, 10);
      let largeImageURI = canvas.toDataURL('jpeg')

      const image = new Morel.Image({
        data: largeImageURI,
        type: 'image/png',
      });

      Controller.createNewRecord(image, (err) => {
        recordManager.storage.size((sizeErr, size) => {
          if (sizeErr) throw sizeErr.message;

          expect(size).to.be.equal(1);
          expect()
          done();
        });
      });
    });
  });
});
