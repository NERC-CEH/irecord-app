import Indicia from 'indicia';
import CONFIG from 'config';
import ImageHelp from 'helpers/image';
import Log from 'helpers/log';
import Device from 'helpers/device';

export default Indicia.Media.extend({
  destroy(...args) {
    Log('MediaModel: destroying.');

    // remove from internal storage
    if (window.cordova) {
      const URL = this.getURL();
      ImageHelp.deleteInternalStorage(URL, () => {
        Indicia.Media.prototype.destroy.apply(this, args);
      });
    }

    Indicia.Media.prototype.destroy.apply(this, args);
  },

  getURL() {
    let URL = this.get('data');
    if (window.cordova && Device.isIOS() && !window.testing) {
      if (CONFIG.build >= 8 && URL.search('file://') >= 0) {
        // fix previous versions
        const pathArray = URL.split('/');
        URL = cordova.file.dataDirectory + pathArray[pathArray.length - 1];
      } else {
        URL = cordova.file.dataDirectory + URL;
      }
    }

    return URL;
  },
});
