/** ****************************************************************************
 * Functions to work with images.
 *****************************************************************************/
import Morel from 'morel';
import _ from 'lodash';
import ImageModel from '../components/common/models/image';
import Log from './log';
import Error from './error';
import Device from './device';

const Image = {
  deleteInternalStorage(name, callback) {
    function errorHandler(err) {
      Log(err, 'e');
      callback(err);
    }
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (fileSystem) => {
      const relativePath = name.replace(fileSystem.nativeURL, '');
      fileSystem.getFile(relativePath, { create: false }, (fileEntry) => {
        if (!fileEntry) {
          callback();
          return;
        }

        fileEntry.remove(() => {
          Log('Helpers:Image: removed.');
          callback();
        }, errorHandler);
      }, errorHandler);
    }, errorHandler);
  },

  /**
   *
   * @param callback
   * @param options
   */
  getImage(callback, options = {}) {
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

    _.extend(cameraOptions, options);

    function onError() {
      const error = Error('Error capturing photo');
      callback(error);
    }

    function fail(error) {
      callback(error);
    }

    function onSuccess(fileURI) {
      let URI = fileURI;
      function copyFile(fileEntry) {
        const name = `${Date.now()}.jpeg`;
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (fileSystem) => {
            // copy to app data directory
            fileEntry.copyTo(
              fileSystem,
              name,
              callback,
              fail
            );
          },
          fail);
      }

      // for some reason when selecting from Android gallery
      // the prefix is sometimes missing
      if (Device.isAndroid() &&
        options.sourceType === window.Camera.PictureSourceType.PHOTOLIBRARY) {
        if (!(/file:\/\//).test(URI)) {
          URI = `file://${URI}`;
        }
      }

      window.resolveLocalFileSystemURL(URI, copyFile, fail);
    }

    navigator.camera.getPicture(onSuccess, onError, cameraOptions);
  },

  /**
   * Create new record with a photo
   */
  getImageModel(file, callback) {
    // create and add new record
    const success = (err, data, type, width, height) => {
      if (err) {
        callback(err);
        return;
      }

      const imageModel = new ImageModel({
        data,
        type,
        width,
        height,
      });

      imageModel.addThumbnail((thumbErr) => {
        if (thumbErr) {
          Log(thumbErr, 'e');
          return;
        }
        callback(null, imageModel);
      });
    };

    if (window.cordova) {
      // don't resize, only get width and height
      Morel.Image.getDataURI(file, (err, data, type, width, height) => {
        let fileName = file;

        if (Device.isIOS()) {
          // save only the file name or iOS, because the app UUID changes
          // on every app update
          const pathArray = file.split('/');
          fileName = pathArray[pathArray.length - 1];
        }
        success(null, fileName, 'jpeg', width, height);
      });
    } else if (file instanceof File) {
      Morel.Image.getDataURI(file, success);
    }
  },
};

export { Image as default };
