import ImageHelp from '../image';
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
      getPicture: (onSuccess, onError) => onSuccess(''),
    };

    window.resolveLocalFileSystemURL = (dir, callback) => {
      callback({ copyTo: (fileSystem, name, callback, fail) => callback() });
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
  });
});
