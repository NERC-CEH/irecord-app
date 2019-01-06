import ImageHelp, { _onGetImageError } from '../image';
import Device from '../device';

describe('Helpers Image', () => {
  beforeEach(() => {
    window.Camera = {
      DestinationType: {},
      Direction: {},
      EncodingType: {},
      MediaType: {},
      PictureSourceType: {},
      PopoverArrowDirection: {},
    };

    window.cordova = { file: {} };

    window.navigator.camera = {
      getPicture: onSuccess => onSuccess(''),
    };

    window.resolveLocalFileSystemURL = (dir, callback) => {
      callback({ copyTo: (fileSystem, name, done) => done() });
    };

    sinon.stub(Device, 'isAndroid').returns(false);
  });

  afterEach(() => {
    delete window.cordova;
    delete window.Camera;
    delete window.navigator.camera;
    delete window.resolveLocalFileSystemURL;
    Device.isAndroid.restore();
  });

  describe('getImage', () => {
    it('should return a promise', done => {
      const promise = ImageHelp.getImage();
      expect(promise).to.be.instanceOf(Promise);
      promise.then(done).catch(done);
    });

    describe('_onGetImageError', () => {
      it('should reject on error', done => {
        _onGetImageError('my error', null, err => {
          expect(err).to.eql('my error');
          done();
        });
      });

      it('should care for missing error', done => {
        _onGetImageError({}, null, err => {
          expect(err).to.eql('');
          done();
        });
      });

      it('should resolve if error includes "cancelled"', done => {
        _onGetImageError('user has cancelled the process', done);
      });

      it('should resolve if error includes "selected"', done => {
        _onGetImageError('user has selected nothing', done);
      });

      it('should resolve if error includes "has no access"', done => {
        _onGetImageError('has no access to assets', done);
      });
    });
  });
});
