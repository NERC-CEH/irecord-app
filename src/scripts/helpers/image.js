/** ****************************************************************************
 * Functions to work with images.
 *****************************************************************************/
import Morel from 'morel';
import ImageModel from '../components/common/image';
import log from './log';
import Error from './error';
import device from './device';

const Image = {
  deleteInternalStorage(name, callback) {
    let errorHandler = function (err) {
      log(err, 'e');
      callback(err);
    }
    const dir = cordova.file.dataDirectory + (device.isIOS ? '' : 'files/');
    window.resolveLocalFileSystemURL(dir, function(fileSystem) {
      let relativePath = name.replace(fileSystem.nativeURL, '');
      fileSystem.getFile(relativePath, {create:false}, function(fileEntry){
        if (!fileEntry) return callback();

        fileEntry.remove(function() {
          log('Helpers:Image: removed.');
          callback();
        }, errorHandler);

      }, errorHandler);
    }, errorHandler);
  },

  getImage(callback, options = {}) {
    let cameraOptions = {
      sourceType: window.Camera.PictureSourceType.CAMERA,
      //allow edit is unpredictable on Android and it should not be used!
      allowEdit: false,
      destinationType: window.Camera.DestinationType.FILE_URI,
      encodingType : window.Camera.EncodingType.JPEG,
      saveToPhotoAlbum: true,
      correctOrientation: true,
    };

    _.extend(cameraOptions, options);

    const onError = () => {
      const error = Error('Error capturing photo');
      callback(error);
    };

    function onSuccess(fileURI) {
      function copyFile(fileEntry) {
        const name = Date.now() + '.jpeg';
        const dir = cordova.file.dataDirectory + (device.isIOS ? '' : 'files/');
        window.resolveLocalFileSystemURL(dir, function(fileSystem) {
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

      function fail(error) {
        callback(error);
      }
      // for some reason when selecting from Android gallery
      // the prefix is missing
      if (device.isAndroid() &&
        options.sourceType === window.Camera.PictureSourceType.PHOTOLIBRARY) {
        fileURI = `file://${fileURI}`;
      }

      window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
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
      imageModel.addThumbnail((err) => {
        if (err) {
          log(err, 'e');
          return;
        }
        callback(null, imageModel);
      });
    };

    if (window.cordova){
      // don't resize, only get width and height
      Morel.Image.getDataURI(file, (err, data, type, width, height) => {
        success(null, file, 'jpeg', width, height);
      });
    } else if (file instanceof File) {
      Morel.Image.getDataURI(file, success);
    }
  },
};

export { Image as default };
