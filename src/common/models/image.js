import Indicia from 'indicia';
import Log from 'helpers/log';

function fixPreviousVersions(URL) {
  if (URL.search('file://') >= 0) {
    return URL.split('/').pop();
  }
  return URL;
}

function deleteFile(fileName) {
  return new Promise((resolve, reject) => {
    function onFileGet(fileEntry) {
      if (!fileEntry) {
        resolve();
        return;
      }

      fileEntry.remove(() => {
        Log('Helpers:Image: removed.');
        resolve();
      }, reject);
    }

    window.resolveLocalFileSystemURL(
      cordova.file.dataDirectory,
      fileSystem => {
        fileSystem.getFile(fileName, { create: false }, onFileGet, reject);
      },
      reject
    );
  });
}

export default Indicia.Media.extend({
  destroy(...args) {
    Log('MediaModel: destroying.');

    // remove from internal storage
    if (!window.cordova || window.testing) {
      Indicia.Media.prototype.destroy.apply(this, args);
      return;
    }

    let URL = this.get('data');
    URL = fixPreviousVersions(URL);

    deleteFile(URL)
      .then(() => {
        Indicia.Media.prototype.destroy.apply(this, args);
      })
      .catch(err => Log(err, 'e'));
  },

  getURL() {
    let URL = this.get('data');

    if (!window.cordova || window.testing) {
      return URL;
    }

    URL = cordova.file.dataDirectory + fixPreviousVersions(URL);
    return window.Ionic.WebView.convertFileSrc(URL);
  },
});
