import $ from 'jquery';
import Morel from 'morel';
import ImageHelp from '../../helpers/image';

export default Morel.Image.extend({
  destroy(options) {
    // remove from internal storage
    if (window.cordova) {
      let name = this.get('data');
      ImageHelp.deleteInternalStorage(name, () => {
        Morel.Image.prototype.destroy.apply(this, arguments);
      });
    }

    Morel.Image.prototype.destroy.apply(this, arguments);
  }
});
