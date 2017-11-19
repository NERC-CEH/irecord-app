import ImageHelp from '../image';

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
  });

  afterEach(() => {
    delete window.cordova;
    delete window.Camera;
    delete window.navigator.camera;
    delete window.resolveLocalFileSystemURL;
  });

  describe('getImage', () => {
    it('should return a promise', done => {
      const promise = ImageHelp.getImage();
      expect(promise).to.be.instanceOf(Promise);
      promise.then(done).catch(done);
    });
  });
});
