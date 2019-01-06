/** ****************************************************************************
 * Loader view with a spinner for async and other components.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import Device from 'helpers/device';
import '../styles/loading.scss';

export default Marionette.View.extend({
  tagName: 'ion-spinner',
  className: 'centered',
  attributes: { name: Device.isIOS() ? 'lines' : 'dots' },
  template: false
});
