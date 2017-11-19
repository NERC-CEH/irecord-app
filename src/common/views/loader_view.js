/** ****************************************************************************
 * Loader view with a spinner for async and other components.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import '../styles/loading.scss';

export default Marionette.View.extend({
  tagName: 'span',
  className: 'icon icon-plus icon-spin centered color-positive',
  template: false,
});
