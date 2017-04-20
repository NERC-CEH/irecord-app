/** ****************************************************************************
 * Surveys List main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';
import './styles.scss';

export default Marionette.View.extend({
  tagName: 'ul',
  className: 'table-view',
  template: JST['surveys/list/main'],

  events: {},

  triggers: {},

  serializeData() {},
});
