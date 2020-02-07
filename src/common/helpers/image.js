/** ****************************************************************************
 * Functions to work with media.
 **************************************************************************** */
import Indicia from '@indicia-js/core';
import Log from './log';
import Device from './device';

export function _onGetImageError(err, resolve, reject) {
  if (typeof err !== 'string') {
    // for some reason the plugin's errors can be non-strings
    err = ''; //eslint-disable-line
  }

  const e = err.toLowerCase();
  if (
    e.includes('has no access') ||
    e.includes('cancelled') ||
    e.includes('selected')
  ) {
    resolve(); // no image selected
    return;
  }
  reject(err);
}

const Image = {
  /**
   * Gets a fileEntry of the selected image from the camera or gallery.
   * If none selected then fileEntry is empty.
   * @param options
   * @returns {Promise}
   */
  getImage(options = {}) {
    return new Promise((resolve, reject) => {
      Log('Helpers:Image: getting.');

      const defaultCameraOptions = {
        sourceType: window.Camera.PictureSourceType.CAMERA,
        // allow edit is unpredictable on Android and it should not be used!
        allowEdit: false,
        quality: 40,
        targetWidth: 1000,
        targetHeight: 1000,
        destinationType: window.Camera.DestinationType.FILE_URI,
        encodingType: window.Camera.EncodingType.JPEG,
        saveToPhotoAlbum: true,
        correctOrientation: true,
      };

      const cameraOptions = { ...{}, ...defaultCameraOptions, ...options };

      if (Device.isAndroid()) {
        // Android bug:
        // https://issues.apache.org/jira/browse/CB-12270
        delete cameraOptions.saveToPhotoAlbum;
      }

      function copyFileToAppStorage(fileURI) {
        let URI = fileURI;
        function onSuccessCopyFile(fileEntry) {
          const name = `${Date.now()}.jpeg`;
          window.resolveLocalFileSystemURL(
            cordova.file.dataDirectory,
            fileSystem => {
              // copy to app data directory
              fileEntry.copyTo(fileSystem, name, resolve, reject);
            },
            reject
          );
        }

        // for some reason when selecting from Android gallery
        // the prefix is sometimes missing
        if (
          Device.isAndroid() &&
          options.sourceType === window.Camera.PictureSourceType.PHOTOLIBRARY
        ) {
          if (!/file:\/\//.test(URI)) {
            URI = `file://${URI}`;
          }
        }

        window.resolveLocalFileSystemURL(URI, onSuccessCopyFile, reject);
      }

      function onSuccess(fileURI) {
        if (
          Device.isAndroid() &&
          cameraOptions.sourceType === window.Camera.PictureSourceType.CAMERA
        ) {
          // Android bug:
          // https://issues.apache.org/jira/browse/CB-12270
          window.cordova.plugins.imagesaver.saveImageToGallery(
            fileURI,
            () => copyFileToAppStorage(fileURI),
            reject
          );
          return;
        }

        copyFileToAppStorage(fileURI);
      }

      navigator.camera.getPicture(
        onSuccess,
        err => _onGetImageError(err, resolve, reject),
        cameraOptions
      );
    });
  },

  /**
   * Create new record with a photo
   */
  getImageModel(ImageModel, file) {
    if (!file) {
      const err = new Error('File not found while creating image model.');
      return Promise.reject(err);
    }

    // create and add new record
    const success = args => {
      const [data, type, width, height] = args;
      const imageModel = new ImageModel({
        attrs: {
          data,
          type,
          width,
          height,
        },
      });

      return imageModel.addThumbnail().then(() => imageModel);
    };

    const isBrowser = !window.cordova && file instanceof File;
    if (isBrowser) {
      return Indicia.Media.getDataURI(file).then(success);
    }

    file = window.Ionic.WebView.convertFileSrc(file); // eslint-disable-line
    return Indicia.Media.getDataURI(file).then(args => {
      // don't resize, only get width and height
      const [, , width, height] = args;
      const fileName = file.split('/').pop();
      return success([fileName, 'jpeg', width, height]);
    });
  },

  validateRemote() {
    // nothing to validate yet
  },
};

export { Image as default };
