/** ****************************************************************************
 * Functions to work with media.
 **************************************************************************** */
import Indicia from 'indicia';
import _ from 'lodash';
import Log from './log';
import Analytics from './analytics';
import Device from './device';

export function _onGetImageError(err = '', resolve, reject) {
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
  deleteInternalStorage(name, callback) {
    function errorHandler(err) {
      Log(err, 'e');
      callback(err);
    }
    window.resolveLocalFileSystemURL(
      cordova.file.dataDirectory,
      fileSystem => {
        const relativePath = name.replace(fileSystem.nativeURL, '');
        fileSystem.getFile(
          relativePath,
          { create: false },
          fileEntry => {
            if (!fileEntry) {
              callback();
              return;
            }

            fileEntry.remove(() => {
              Log('Helpers:Image: removed.');
              callback();
            }, errorHandler);
          },
          errorHandler
        );
      },
      errorHandler
    );
  },

  /**
   * Gets a fileEntry of the selected image from the camera or gallery.
   * If none selected then fileEntry is empty.
   * @param options
   * @returns {Promise}
   */
  getImage(options = {}) {
    return new Promise((resolve, reject) => {
      Log('Helpers:Image: getting.');

      const cameraOptions = {
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

      if (Device.isAndroid()) {
        // Android bug:
        // https://issues.apache.org/jira/browse/CB-12270
        delete cameraOptions.saveToPhotoAlbum;
      }

      _.extend(cameraOptions, options);

      function copyFileToAppStorage(fileURI) {
        let URI = fileURI;
        function copyFile(fileEntry) {
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

        window.resolveLocalFileSystemURL(URI, copyFile, reject);
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
        } else {
          copyFileToAppStorage(fileURI);
        }
      }

      navigator.camera.getPicture(
        onSuccess,
        err => _onGetImageError(err, resolve, reject),
        cameraOptions
      );
      Analytics.trackEvent('Image', 'get', cameraOptions.sourceType);
    });
  },

  /**
   * Create new record with a photo
   */
  getImageModel(ImageModel, file) {
    // create and add new record
    const success = args => {
      const [data, type, width, height] = args;
      const imageModel = new ImageModel({
        data,
        type,
        width,
        height,
      });

      return imageModel.addThumbnail().then(() => imageModel);
    };

    if (window.cordova) {
      // cordova environment
      return Indicia.Media.getDataURI(file).then(args => {
        // don't resize, only get width and height
        const [, , width, height] = args;
        let fileName = file;

        if (Device.isIOS()) {
          // save only the file name or iOS, because the app UUID changes
          // on every app update
          const pathArray = file.split('/');
          fileName = pathArray[pathArray.length - 1];
        }
        return success([fileName, 'jpeg', width, height]);
      });
    } else if (file instanceof File) {
      // browser environment
      return Indicia.Media.getDataURI(file).then(success);
    }

    const err = new Error('File not found while creating image model.');
    return Promise.reject(err);
  },
};

export { Image as default };
