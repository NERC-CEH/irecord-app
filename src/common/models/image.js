import Indicia from 'indicia';
import CONFIG from 'config';
import Log from 'helpers/log';

function deleteFile(fileName) {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(
      cordova.file.dataDirectory,
      fileSystem => {
        fileSystem.getFile(
          fileName,
          { create: false },
          fileEntry => {
            if (!fileEntry) {
              resolve();
              return;
            }

            fileEntry.remove(() => {
              Log('Helpers:Image: removed.');
              resolve();
            }, reject);
          },
          reject
        );
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

    const fileName = this.get('data');
    deleteFile(fileName)
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

    const fixPreviousVersions = CONFIG.build >= 8 && URL.search('file://') >= 0;
    if (fixPreviousVersions) {
      const fileName = URL.split('/').pop();
      URL = cordova.file.dataDirectory + fileName;
    }

    URL = cordova.file.dataDirectory + URL;
    return window.Ionic.WebView.convertFileSrc(URL);
  }
});
