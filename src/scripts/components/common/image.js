import $ from 'jquery';
import Morel from 'morel';
import CONFIG from 'config';
import ImageHelp from '../../helpers/image';
import Device from '../../helpers/device';

export default Morel.Image.extend({
  destroy(options) {
    // remove from internal storage
    if (window.cordova) {
      let URL = this.getURL();
      ImageHelp.deleteInternalStorage(URL, () => {
        Morel.Image.prototype.destroy.apply(this, arguments);
      });
    }

    Morel.Image.prototype.destroy.apply(this, arguments);
  },

  getURL() {
    let URL = this.get('data');
    if (window.cordova && Device.isIOS()) {
      if (CONFIG.build >= 8 && URL.search('file://') >= 0) {
        // fix previous versions
        const pathArray = URL.split('/');
        URL = cordova.file.dataDirectory + pathArray[pathArray.length - 1];
      } else {
        URL = cordova.file.dataDirectory + URL;
      }
    }

    return URL
  }
});
