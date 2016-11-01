import Morel from 'morel';
import CONFIG from 'config';
import { ImageHelp, Device } from 'helpers';

export default Morel.Image.extend({
  destroy(...args) {
    // remove from internal storage
    if (window.cordova) {
      const URL = this.getURL();
      ImageHelp.deleteInternalStorage(URL, () => {
        Morel.Image.prototype.destroy.apply(this, args);
      });
    }

    Morel.Image.prototype.destroy.apply(this, args);
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
