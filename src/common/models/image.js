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

class Media extends Indicia.Media {
  async destroy(silent) {
    Log('MediaModel: destroying.');

    // remove from internal storage
    if (!window.cordova || window.testing) {
      if (!this.parent) {
        return null;
      }

      this.parent.media.remove(this);

      if (silent) {
        return null;
      }

      return this.parent.save();
    }

    let URL = this.attrs.data;
    URL = fixPreviousVersions(URL);

    try {
      await deleteFile(URL);
      if (!this.parent) {
        return null;
      }
      this.parent.media.remove(this);

      if (silent) {
        return null;
      }

      return this.parent.save();
    } catch (err) {
      Log(err, 'e');
      return null;
    }
  }

  getURL() {
    let URL = this.attrs.data;

    if (!window.cordova || window.testing) {
      return URL;
    }

    URL = cordova.file.dataDirectory + fixPreviousVersions(URL);
    return window.Ionic.WebView.convertFileSrc(URL);
  }

  // eslint-disable-next-line
  validateRemote() {
    return null;
  }
}

export default Media;
